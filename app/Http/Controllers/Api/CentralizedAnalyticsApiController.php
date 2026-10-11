<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CentralizedAnalytic;
use App\Models\ProjectSyncStatus;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CentralizedAnalyticsApiController
{
    /**
     * Receive a batch of analytics events from a client website.
     */
    public function receiveBatch(Request $request): JsonResponse
    {
        $secret = config('analytics.ops_board_secret');
        $providedSecret = $request->header('X-Ops-Secret');
        if (! is_string($secret) || $secret === '' || ! is_string($providedSecret) || ! hash_equals($secret, $providedSecret)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $supportedKeys = array_keys(CentralizedAnalytic::supportedProjects());

        $validated = $request->validate([
            'project_key' => ['required', 'string', Rule::in($supportedKeys)],
            'events' => ['required', 'array', 'min:1', 'max:2000'],
            'events.*.session_id' => ['required', 'string', 'max:100'],
            'events.*.event_type' => ['required', 'string', 'max:50'],
            'events.*.event_data' => ['nullable'],
            'events.*.referral_source' => ['nullable', 'string', 'max:255'],
            'events.*.utm_source' => ['nullable', 'string', 'max:255'],
            'events.*.utm_medium' => ['nullable', 'string', 'max:255'],
            'events.*.utm_campaign' => ['nullable', 'string', 'max:255'],
            'events.*.utm_content' => ['nullable', 'string', 'max:255'],
            'events.*.utm_term' => ['nullable', 'string', 'max:255'],
            'events.*.ip_hash' => ['nullable', 'string', 'max:64'],
            'events.*.user_agent' => ['nullable', 'string', 'max:500'],
            'events.*.user_id' => ['nullable', 'integer'],
            'events.*.created_at' => ['nullable'],
            'events.*.occurred_at' => ['nullable'],
        ]);

        $projectKey = $validated['project_key'];
        $events = $validated['events'];
        $now = now();

        DB::beginTransaction();
        try {
            $inserted = 0;
            $skipped = 0;

            foreach ($events as $item) {
                $occurredRaw = $item['occurred_at'] ?? $item['created_at'] ?? null;
                $occurredAt = $occurredRaw ? Carbon::parse($occurredRaw) : $now;

                $eventData = $item['event_data'] ?? null;
                if (is_string($eventData)) {
                    $decoded = json_decode($eventData, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $eventData = $decoded;
                    }
                }

                // Check for deduplication
                $eventId = is_array($eventData) ? ($eventData['event_id'] ?? null) : null;
                $existsQuery = CentralizedAnalytic::query()
                    ->where('project_key', $projectKey)
                    ->where('session_id', $item['session_id'])
                    ->where('event_type', $item['event_type'])
                    ->where('occurred_at', $occurredAt);

                if ($existsQuery->exists()) {
                    $skipped++;
                    continue;
                }

                if ($eventId) {
                    $duplicateEventId = CentralizedAnalytic::query()
                        ->where('project_key', $projectKey)
                        ->where('event_data->event_id', $eventId)
                        ->exists();

                    if ($duplicateEventId) {
                        $skipped++;
                        continue;
                    }
                }

                CentralizedAnalytic::create([
                    'project_key' => $projectKey,
                    'session_id' => $item['session_id'],
                    'event_type' => $item['event_type'],
                    'event_data' => $eventData,
                    'referral_source' => $item['referral_source'] ?? null,
                    'utm_source' => $item['utm_source'] ?? null,
                    'utm_medium' => $item['utm_medium'] ?? null,
                    'utm_campaign' => $item['utm_campaign'] ?? null,
                    'utm_content' => $item['utm_content'] ?? null,
                    'utm_term' => $item['utm_term'] ?? null,
                    'ip_hash' => $item['ip_hash'] ?? null,
                    'user_agent' => $item['user_agent'] ?? null,
                    'user_id' => $item['user_id'] ?? null,
                    'occurred_at' => $occurredAt,
                    'synced_at' => $now,
                ]);

                $inserted++;
            }

            // Update or create project sync status
            $projectName = CentralizedAnalytic::supportedProjects()[$projectKey] ?? $projectKey;
            $syncStatus = ProjectSyncStatus::firstOrNew(['project_key' => $projectKey]);
            $syncStatus->project_name = $projectName;
            $syncStatus->last_synced_at = $now;
            $syncStatus->last_batch_count = $inserted;
            $syncStatus->total_events_synced = ($syncStatus->total_events_synced ?? 0) + $inserted;
            $syncStatus->last_status = 'success';
            $syncStatus->last_error_message = null;
            $syncStatus->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'project_key' => $projectKey,
                'received' => count($events),
                'inserted' => $inserted,
                'skipped' => $skipped,
                'last_synced_at' => $now->toIso8601String(),
                'message' => "Batch successfully synced: {$inserted} inserted, {$skipped} skipped.",
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            // Record error in sync status
            ProjectSyncStatus::updateOrCreate(
                ['project_key' => $projectKey],
                [
                    'project_name' => CentralizedAnalytic::supportedProjects()[$projectKey] ?? $projectKey,
                    'last_status' => 'error',
                    'last_error_message' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sync health and status for all monitored projects.
     */
    public function status(): JsonResponse
    {
        ProjectSyncStatus::seedDefaultProjects();
        $statuses = ProjectSyncStatus::all();

        return response()->json([
            'success' => true,
            'projects' => $statuses,
        ]);
    }
}
