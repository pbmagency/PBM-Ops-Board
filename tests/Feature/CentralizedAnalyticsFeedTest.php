<?php

namespace Tests\Feature;

use App\Models\CentralizedAnalytic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CentralizedAnalyticsFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_sections_use_the_project_feed(): void
    {
        Http::fake(fn () => Http::response([
            'success' => true,
            'schema_version' => 2,
            'stats' => [
                'total_visits' => 12,
                'unique_visitors' => 10,
                'engaged' => 6,
                'intent' => 4,
                'direct_checkouts' => 2,
                'whatsapp_leads' => 1,
                'total_leads' => 3,
            ],
            'performance_matrix' => [['landing_source' => '/landing', 'visits' => 10, 'total_lead_rate' => 30]],
            'chart_data' => [['raw_date' => now()->toDateString(), 'visits' => 10, 'engaged' => 6, 'intent' => 4, 'leads' => 3]],
            'referral_data' => [['referral_source' => 'google', 'count' => 5]],
            'utm_campaign_data' => [['utm_campaign' => 'promo', 'count' => 3]],
        ]));

        $this->get('/analytics?project=project-pbm&range=7')->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Analytics/CentralizedAnalytics')
                ->where('stats.total_visits', 12)
                ->where('chartData.7.visits', 10)
                ->where('projectBreakdown.3.visits', 12)
                ->where('referralData.0.referral_source', 'google')
                ->where('utmCampaignData.0.utm_campaign', 'promo')
                ->where('recentEvents', []));
        Http::assertSent(fn ($request) => ! $request->hasHeader('X-Ops-Secret') && ! str_contains($request->url(), 'token='));
    }

    public function test_failed_feed_does_not_fall_back_to_stale_batch_events(): void
    {
        Http::fake(fn () => Http::response(['error' => 'unavailable'], 503));
        CentralizedAnalytic::create([
            'project_key' => 'project-pbm', 'session_id' => 'old-session',
            'event_type' => 'visit', 'occurred_at' => now(), 'synced_at' => now(),
        ]);

        $this->get('/analytics?project=project-pbm&range=7')->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stats.total_visits', 0)
                ->where('availableProjects', []));
    }

    public function test_fullbright_is_available_as_a_project(): void
    {
        Http::fake(fn () => Http::response([
            'success' => true,
            'schema_version' => 2,
            'stats' => ['total_visits' => 9, 'unique_visitors' => 8],
            'performance_matrix' => [],
            'chart_data' => [],
            'referral_data' => [],
            'utm_campaign_data' => [],
        ]));

        $this->get('/analytics?project=project-fullbright&range=7')->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Analytics/CentralizedAnalytics')
                ->where('selectedProject', 'project-fullbright')
                ->where('stats.total_visits', 9)
                ->where('availableProjects', ['project-fullbright']));

        Http::assertSent(fn ($request) => str_contains($request->url(), 'toefl.fullbrightindonesia.org/ops-analytics/feed'));
    }
}
