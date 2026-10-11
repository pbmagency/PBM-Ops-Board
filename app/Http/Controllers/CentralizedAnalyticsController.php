<?php

namespace App\Http\Controllers;

use App\Models\CentralizedAnalytic;
use App\Models\ProjectSyncStatus;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

use App\Services\CentralizedFeedFetcherService;
use App\Services\FeedAnalyticsPresenter;

class CentralizedAnalyticsController
{
    /**
     * Display the centralized analytics dashboard (accessible without login).
     */
    public function index(Request $request): Response
    {
        ProjectSyncStatus::seedDefaultProjects();

        $supportedProjects = CentralizedAnalytic::supportedProjects();
        $allowedProjectKeys = array_merge(['all'], array_keys($supportedProjects));

        $validated = $request->validate([
            'project' => ['nullable', 'string', Rule::in($allowedProjectKeys)],
            'range' => ['nullable', Rule::in(['7', '30', '90', '365'])],
        ]);

        $selectedProject = $validated['project'] ?? 'all';
        $dateRange = $validated['range'] ?? '30';
        $feeds = app(CentralizedFeedFetcherService::class)->getAllFeeds((int) $dateRange, $request->boolean('refresh'));
        $dashboard = app(FeedAnalyticsPresenter::class)->present($feeds, $selectedProject, (int) $dateRange);
        $syncStatuses = ProjectSyncStatus::all()->keyBy('project_key');

        return Inertia::render('Analytics/CentralizedAnalytics', [
            'selectedProject' => $selectedProject,
            'dateRange' => $dateRange,
            'projectsList' => $this->getProjectsList(),
            'stats' => $dashboard['stats'],
            'funnel' => $this->buildFunnel($dashboard['stats']),
            'chartData' => $dashboard['chartData'],
            'projectBreakdown' => $dashboard['projectBreakdown'],
            'performanceMatrix' => $dashboard['performanceMatrix'],
            'projectMatrices' => $dashboard['projectMatrices'],
            'referralData' => $dashboard['referralData'],
            'utmCampaignData' => $dashboard['utmCampaignData'],
            'recentEvents' => $dashboard['recentEvents'],
            'syncStatuses' => $syncStatuses,
            'availableProjects' => $dashboard['availableProjects'],
        ]);
    }

    /**
     * Export analytics data to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $supportedProjects = CentralizedAnalytic::supportedProjects();
        $allowedProjectKeys = array_merge(['all'], array_keys($supportedProjects));

        $validated = $request->validate([
            'project' => ['nullable', 'string', Rule::in($allowedProjectKeys)],
            'range' => ['nullable', Rule::in(['7', '30', '90', '365'])],
        ]);

        $selectedProject = $validated['project'] ?? 'all';
        $dateRange = $validated['range'] ?? '30';
        $feeds = app(CentralizedFeedFetcherService::class)->getAllFeeds((int) $dateRange);
        $dashboard = app(FeedAnalyticsPresenter::class)->present($feeds, $selectedProject, (int) $dateRange);
        $records = $dashboard['performanceMatrix'];

        return response()->stream(function () use ($records) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Project', 'Landing Source', 'Visits', 'Engaged',
                'Direct Checkouts', 'WhatsApp Leads', 'Total Leads', 'Total Lead Rate',
            ]);

            foreach ($records as $row) {
                fputcsv($file, [
                    $row['project_key'],
                    $row['landing_source'] ?? '/',
                    $row['visits'] ?? 0,
                    $row['engagement'] ?? 0,
                    $row['direct_checkouts'] ?? 0,
                    $row['whatsapp_leads'] ?? 0,
                    $row['total_leads'] ?? 0,
                    $row['total_lead_rate'] ?? 0,
                ]);
            }

            fclose($file);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=pbm-ops-analytics-{$selectedProject}-{$dateRange}d.csv",
        ]);
    }

    private function getProjectsList(): array
    {
        $list = [
            [
                'key' => 'all',
                'name' => 'All Projects (Overview)',
                'badge' => 'Consolidated',
            ],
        ];

        foreach (CentralizedAnalytic::supportedProjects() as $key => $name) {
            $list[] = [
                'key' => $key,
                'name' => $name,
                'badge' => $key,
            ];
        }

        return $list;
    }

    private function buildFunnel(array $stats): array
    {
        $visits = $stats['unique_visitors'];
        $safePct = function ($num, $denom) {
            return ($denom > 0) ? round(($num / $denom) * 100, 1) : 0;
        };

        $steps = [
            ['stage' => 'Unique Visits', 'count' => $visits, 'from' => null],
            ['stage' => 'Engaged Visitors', 'count' => $stats['engaged'], 'from' => 'Unique Visits'],
            ['stage' => 'Purchase Intent', 'count' => $stats['intent'], 'from' => 'Engaged Visitors'],
            ['stage' => 'Direct Checkout', 'count' => $stats['direct_checkouts'], 'from' => 'Purchase Intent'],
            ['stage' => 'WhatsApp Leads', 'count' => $stats['whatsapp_leads'], 'from' => 'Purchase Intent'],
            ['stage' => 'Total Leads', 'count' => $stats['total_leads'], 'from' => 'Purchase Intent'],
        ];

        return array_map(function ($step) use ($visits, $safePct, $stats) {
            $prevCount = match ($step['from']) {
                'Unique Visits' => $visits,
                'Engaged Visitors' => $stats['engaged'],
                'Purchase Intent' => $stats['intent'],
                default => $visits,
            };

            return [
                'stage' => $step['stage'],
                'count' => $step['count'],
                'percentage' => $safePct($step['count'], $visits),
                'dropoff_rate' => ($step['from'] !== null) ? max(0, round(100 - $safePct($step['count'], $prevCount), 1)) : 0,
            ];
        }, $steps);
    }

}
