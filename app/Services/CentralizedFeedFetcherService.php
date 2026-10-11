<?php

namespace App\Services;

use App\Models\ProjectSyncStatus;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CentralizedFeedFetcherService
{
    public const CACHE_TTL_SECONDS = 300; // 5 minutes

    /**
     * Supported feed sources with their target URLs.
     */
    public function getProjectConfigs(): array
    {
        return [
            'project-pbm' => [
                'name' => 'Project PBM',
                'url' => config('analytics.feed_urls.project-pbm'),
            ],
            'lp-gorden' => [
                'name' => 'LP Gorden',
                'url' => config('analytics.feed_urls.lp-gorden'),
            ],
            'lp-menjangan' => [
                'name' => 'LP Menjangan',
                'url' => config('analytics.feed_urls.lp-menjangan'),
            ],
            'ecourse-ka-tsan' => [
                'name' => 'Ecourse Ka Tsan',
                'url' => config('analytics.feed_urls.ecourse-ka-tsan'),
            ],
            'project-fullbright' => [
                'name' => 'Fullbright TOEFL',
                'url' => config('analytics.feed_urls.project-fullbright'),
            ],
        ];
    }

    /**
     * Fetch feed for a single project (or get from cache).
     */
    public function getProjectFeed(string $projectKey, int $rangeDays = 30, bool $forceFresh = false): array
    {
        $configs = $this->getProjectConfigs();
        if (! isset($configs[$projectKey])) {
            return [];
        }

        $config = $configs[$projectKey];
        $cacheKey = "ops_feed_{$projectKey}_{$rangeDays}";

        if (! $forceFresh && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            if (($cached['schema_version'] ?? 0) >= 2) return $cached;
        }

        try {
            $request = Http::timeout(10)->acceptJson();
            $originIp = config("analytics.feed_origin_ips.{$projectKey}");
            if (is_string($originIp) && $originIp !== '') {
                $host = parse_url($config['url'], PHP_URL_HOST);
                if (! is_string($host) || parse_url($config['url'], PHP_URL_SCHEME) !== 'https') {
                    throw new Exception('Fullbright feed origin requires an HTTPS URL.');
                }
                $request = $request->withOptions([
                    'curl' => [CURLOPT_RESOLVE => ["{$host}:443:{$originIp}"]],
                ]);
            }
            $response = $request->get($config['url'], ['range' => $rangeDays]);

            if ($response->successful()) {
                $data = $response->json();
                if (is_array($data) && ! empty($data['success']) && ($data['schema_version'] ?? 0) >= 2) {
                    Cache::put($cacheKey, $data, self::CACHE_TTL_SECONDS);

                    // Update sync status record
                    ProjectSyncStatus::updateOrCreate(
                        ['project_key' => $projectKey],
                        [
                            'project_name' => $config['name'],
                            'last_synced_at' => now(),
                            'total_events_synced' => (int) ($data['stats']['total_visits'] ?? 0),
                            'last_batch_count' => count($data['performance_matrix'] ?? []),
                            'last_status' => 'success',
                            'last_error_message' => null,
                        ]
                    );

                    return $data;
                }
            }

            $error = $response->successful() ? 'Feed schema belum versi 2' : 'Feed HTTP '.$response->status();
            Log::warning("Failed to fetch feed for {$projectKey}: {$error}");
            ProjectSyncStatus::updateOrCreate(
                ['project_key' => $projectKey],
                ['project_name' => $config['name'], 'last_status' => 'error', 'last_error_message' => $error]
            );
        } catch (Exception $e) {
            Log::error("Exception fetching feed for {$projectKey}: " . $e->getMessage());

            ProjectSyncStatus::updateOrCreate(
                ['project_key' => $projectKey],
                [
                    'project_name' => $config['name'],
                    'last_status' => 'error',
                    'last_error_message' => $e->getMessage(),
                ]
            );
        }

        $cached = Cache::get($cacheKey, []);
        if (($cached['schema_version'] ?? 0) >= 2) return $cached;

        return [
            'success' => false,
            'project_key' => $projectKey,
            'project_name' => $config['name'],
            'stats' => [],
            'performance_matrix' => [],
        ];
    }

    /**
     * Fetch all project feeds.
     */
    public function getAllFeeds(int $rangeDays = 30, bool $forceFresh = false): array
    {
        $all = [];
        foreach (array_keys($this->getProjectConfigs()) as $projectKey) {
            $all[$projectKey] = $this->getProjectFeed($projectKey, $rangeDays, $forceFresh);
        }
        return $all;
    }
}
