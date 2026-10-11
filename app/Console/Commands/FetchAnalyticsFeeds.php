<?php

namespace App\Console\Commands;

use App\Services\CentralizedFeedFetcherService;
use Illuminate\Console\Command;

class FetchAnalyticsFeeds extends Command
{
    protected $signature = 'analytics:fetch-feeds {--force : Force fresh fetch ignoring cache} {--range=30 : Date range in days}';

    protected $description = 'Fetch and cache analytics summary feeds from all client projects hourly';

    public function handle(CentralizedFeedFetcherService $fetcher): int
    {
        $range = (int) $this->option('range') ?: 30;
        $force = (bool) $this->option('force');

        $this->info("Fetching analytics summary feeds for all projects (range: {$range} days)...");

        $configs = $fetcher->getProjectConfigs();
        foreach ($configs as $key => $conf) {
            $this->line("Fetching [{$key}] from {$conf['url']}...");
            $data = $fetcher->getProjectFeed($key, $range, $force);

            if (! empty($data['success'])) {
                $visits = $data['stats']['total_visits'] ?? 0;
                $variants = count($data['performance_matrix'] ?? []);
                $this->info("✓ [{$key}] Synced: {$visits} visits, {$variants} variants.");
            } else {
                $this->warn("⚠ [{$key}] Could not fetch feed or empty data.");
            }
        }

        $this->info('Analytics feeds fetch completed.');
        return Command::SUCCESS;
    }
}
