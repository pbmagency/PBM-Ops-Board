<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Cycle;
use App\Models\Feedback;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class OperationalDataSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(database_path('data/ops-demo.json')), true, flags: JSON_THROW_ON_ERROR);

        foreach ($data['clients'] as $source) {
            Client::query()->updateOrCreate(
                ['id' => $source['id']],
                ['name' => $source['name'], 'contract' => $source['contract'], 'bottleneck' => $source['bottleneck'] ?? ''],
            );
        }

        $actorId = User::query()->where('role', 'coo')->value('id');
        foreach ($data['tasks'] as $source) {
            $done = $source['status'] === 'done';
            $task = Task::query()->updateOrCreate(
                ['id' => (string) $source['id']],
                [
                    'client_id' => $source['client'], 'name' => $source['name'], 'status' => $source['status'],
                    'pic' => $source['pic'], 'due' => $source['due'], 'completed_at' => $done ? $source['due'] : null,
                    'due_at_completion' => $done ? $source['due'] : null, 'cycle' => $source['cycle'],
                    'revision' => $source['revision'], 'priority' => $source['priority'], 'type' => $source['type'],
                    'brief' => $source['brief'] ?? '', 'blocked' => $source['blocked'] ?? false,
                ],
            );
            if ($task->statusEvents()->doesntExist()) {
                $task->statusEvents()->create([
                    'from_status' => null, 'to_status' => $task->status, 'changed_by' => $actorId, 'due_snapshot' => $task->due,
                ]);
            }
        }

        foreach ($data['cycles'] as $source) {
            $cycle = Cycle::query()->updateOrCreate(
                ['id' => $source['id']],
                [
                    'client_id' => $source['client'], 'cycle' => $source['cycle'], 'periode' => $source['periode'],
                    'update_date' => $source['updateDate'], 'status' => $source['cycle'] === 0 ? 'Baseline' : $source['status'],
                    'layer' => $source['layer'] ?? '', 'bottleneck' => $source['bottleneck'] ?? '',
                    'primary_metric' => $source['primaryMetric'] === '—' ? 'Lead Rate' : $source['primaryMetric'],
                    'hypothesis' => $source['hypothesis'] ?? '', 'optimization' => $source['optimization'] ?? '',
                ],
            );
            foreach ($source['variants'] as $variant) {
                $cycle->variants()->updateOrCreate(
                    ['id' => $variant['id']],
                    [
                        'label' => $variant['label'], 'is_control' => $variant['isControl'],
                        'target_visit' => $variant['targetVisit'], 'real_visit' => $variant['realVisit'],
                        'bounce_rate' => $variant['bounceRate'], 'lead_rate' => $variant['leadRate'], 'intent_rate' => $variant['intentRate'],
                    ],
                );
            }
        }

        foreach ($data['feedback'] as $source) {
            Feedback::query()->updateOrCreate(
                ['id' => $source['id']],
                [
                    'client_id' => $source['client'], 'date' => $source['date'], 'phase' => $source['phase'],
                    'from' => $source['from'], 'from_type' => $source['fromType'], 'topic' => $source['topic'],
                    'details' => $source['details'], 'priority' => $source['priority'], 'action' => $source['action'] ?? '',
                ],
            );
        }
    }
}
