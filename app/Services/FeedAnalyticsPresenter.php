<?php

namespace App\Services;

use App\Models\CentralizedAnalytic;
use Carbon\Carbon;

class FeedAnalyticsPresenter
{
    public function present(array $feeds, string $selectedProject, int $rangeDays): array
    {
        $projects = CentralizedAnalytic::supportedProjects();
        $keys = $selectedProject === 'all' ? array_keys($projects) : [$selectedProject];
        $available = array_filter($keys, fn ($key) => ! empty($feeds[$key]['success']));

        $statsByProject = [];
        $matrices = [];
        $breakdown = [];
        foreach ($projects as $key => $name) {
            $feed = ! empty($feeds[$key]['success']) ? $feeds[$key] : [];
            $statsByProject[$key] = $this->normalizeStats($feed['stats'] ?? []);
            $matrices[$key] = array_map(function ($row) use ($key, $name) {
                $row['project_key'] = $key;
                $row['project_name'] = $name;
                return $row;
            }, $feed['performance_matrix'] ?? []);
            $s = $statsByProject[$key];
            $breakdown[] = [
                'key' => $key,
                'name' => $name,
                'visits' => $s['total_visits'],
                'unique_visitors' => $s['unique_visitors'],
                'intent' => $s['intent'],
                'direct_checkouts' => $s['direct_checkouts'],
                'whatsapp_leads' => $s['whatsapp_leads'],
                'leads' => $s['total_leads'],
                'conversion_rate' => $s['total_lead_rate'],
            ];
        }

        $stats = $selectedProject === 'all'
            ? $this->aggregateStats(array_map(fn ($key) => $statsByProject[$key], $available))
            : $statsByProject[$selectedProject];

        $chart = [];
        $start = Carbon::now()->subDays($rangeDays)->startOfDay();
        for ($day = $start->copy(); $day->lte(Carbon::now()); $day->addDay()) {
            $key = $day->toDateString();
            $chart[$key] = ['date' => $day->format('d M'), 'raw_date' => $key, 'visits' => 0, 'engaged' => 0, 'intent' => 0, 'leads' => 0];
        }

        $referrals = [];
        $campaigns = [];
        $events = [];
        foreach ($available as $key) {
            $feed = $feeds[$key];
            foreach ($feed['chart_data'] ?? [] as $row) {
                $date = $row['raw_date'] ?? null;
                if (! isset($chart[$date])) continue;
                foreach (['visits', 'engaged', 'intent', 'leads'] as $field) {
                    $chart[$date][$field] += (int) ($row[$field] ?? 0);
                }
            }
            foreach ($feed['referral_data'] ?? [] as $row) {
                $source = $row['referral_source'] ?? '';
                if ($source !== '') $referrals[$source] = ($referrals[$source] ?? 0) + (int) ($row['count'] ?? 0);
            }
            foreach ($feed['utm_campaign_data'] ?? [] as $row) {
                $campaign = $row['utm_campaign'] ?? '';
                if ($campaign !== '') $campaigns[$campaign] = ($campaigns[$campaign] ?? 0) + (int) ($row['count'] ?? 0);
            }
            foreach ($feed['recent_events'] ?? [] as $event) {
                $event['project_key'] = $key;
                $event['id'] = $key.'-'.($event['id'] ?? '');
                $events[] = $event;
            }
        }
        usort($events, fn ($a, $b) => strcmp($b['occurred_at'] ?? '', $a['occurred_at'] ?? ''));
        arsort($referrals);
        arsort($campaigns);

        return [
            'stats' => $stats,
            'chartData' => array_values($chart),
            'projectBreakdown' => $breakdown,
            'performanceMatrix' => $selectedProject === 'all' ? array_merge(...array_values($matrices)) : $matrices[$selectedProject],
            'projectMatrices' => $matrices,
            'referralData' => array_map(fn ($source, $count) => ['referral_source' => $source, 'count' => $count], array_keys(array_slice($referrals, 0, 8, true)), array_values(array_slice($referrals, 0, 8, true))),
            'utmCampaignData' => array_map(fn ($campaign, $count) => ['utm_campaign' => $campaign, 'count' => $count], array_keys(array_slice($campaigns, 0, 8, true)), array_values(array_slice($campaigns, 0, 8, true))),
            'recentEvents' => array_slice($events, 0, 20),
            'availableProjects' => array_values($available),
        ];
    }

    private function normalizeStats(array $s): array
    {
        $unique = (int) ($s['unique_visitors'] ?? 0);
        $visits = (int) ($s['total_visits'] ?? 0);
        $engaged = (int) ($s['engaged'] ?? round($visits * (float) ($s['engagement_rate'] ?? 0) / 100));
        $intent = (int) ($s['intent'] ?? ($s['cta_clicks'] ?? 0));
        $checkouts = (int) ($s['direct_checkouts'] ?? ($s['payments'] ?? 0));
        $wa = (int) ($s['whatsapp_leads'] ?? ($s['conversions'] ?? 0));
        $leads = (int) ($s['total_leads'] ?? ($checkouts + $wa));
        $pct = fn ($value, $denominator) => $denominator ? round($value * 100 / $denominator, 2) : 0;
        return [
            'total_visits' => $visits,
            'unique_visitors' => $unique,
            'engaged' => $engaged,
            'engagement_rate' => (float) ($s['engagement_rate'] ?? $pct($engaged, $unique)),
            'intent' => $intent,
            'intent_rate' => (float) ($s['intent_rate'] ?? $pct($intent, $unique)),
            'direct_checkouts' => $checkouts,
            'direct_checkout_rate' => (float) ($s['direct_checkout_rate'] ?? $pct($checkouts, $unique)),
            'whatsapp_leads' => $wa,
            'whatsapp_lead_rate' => (float) ($s['whatsapp_lead_rate'] ?? $pct($wa, $unique)),
            'total_leads' => $leads,
            'total_lead_rate' => (float) ($s['total_lead_rate'] ?? $pct($leads, $unique)),
            'total_leads_from_intent_rate' => (float) ($s['total_leads_from_intent_rate'] ?? $pct($leads, $intent)),
        ];
    }

    private function aggregateStats(array $rows): array
    {
        $stats = $this->normalizeStats([]);
        foreach ($rows as $row) {
            foreach (['total_visits', 'unique_visitors', 'engaged', 'intent', 'direct_checkouts', 'whatsapp_leads', 'total_leads'] as $field) {
                $stats[$field] += $row[$field];
            }
        }
        $u = $stats['unique_visitors'];
        $i = $stats['intent'];
        foreach (['engaged' => 'engagement_rate', 'intent' => 'intent_rate', 'direct_checkouts' => 'direct_checkout_rate', 'whatsapp_leads' => 'whatsapp_lead_rate', 'total_leads' => 'total_lead_rate'] as $count => $rate) {
            $stats[$rate] = $u ? round($stats[$count] * 100 / $u, 2) : 0;
        }
        $stats['total_leads_from_intent_rate'] = $i ? round($stats['total_leads'] * 100 / $i, 2) : 0;
        return $stats;
    }
}
