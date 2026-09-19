<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Feedback;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RoleUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationalCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleUserSeeder::class);
    }

    public function test_coo_crud_is_persisted_with_task_history_and_cascades(): void
    {
        $coo = User::where('email', 'coo@gmail.com')->firstOrFail();
        $this->actingAs($coo)->post('/clients', [
            'name' => 'Database Client', 'contract' => 'Project-Based', 'bottleneck' => '',
        ])->assertRedirect();
        $client = Client::where('name', 'Database Client')->firstOrFail();

        $this->actingAs($coo)->post('/tasks', $this->taskPayload($client->id))->assertRedirect();
        $task = Task::where('name', 'Database Task')->firstOrFail();
        $this->assertDatabaseHas('task_status_events', ['task_id' => $task->id, 'to_status' => 'intake']);
        $this->assertDatabaseHas('task_assignees', ['task_id' => $task->id, 'role' => 'developer']);
        $this->assertDatabaseHas('task_assignees', ['task_id' => $task->id, 'role' => 'creative']);

        $this->actingAs($coo)->patch("/tasks/{$task->id}/status", ['status' => 'done'])->assertRedirect();
        $task->refresh();
        $this->assertSame('done', $task->status);
        $this->assertNotNull($task->completed_at);
        $this->assertSame('2026-09-20', $task->due_at_completion->format('Y-m-d'));
        $this->assertDatabaseHas('task_status_events', ['task_id' => $task->id, 'from_status' => 'intake', 'to_status' => 'done']);

        $this->actingAs($coo)->post('/cycles', [
            'client' => $client->id, 'cycle' => 1, 'periode' => 'Sep 2026',
            'updateDate' => '2026-09-20', 'status' => 'Baseline', 'layer' => 'Hero',
            'bottleneck' => '', 'primaryMetric' => 'Lead Rate', 'hypothesis' => 'Test', 'optimization' => 'Run',
            'variants' => [
                ['id' => 'temp-a', 'label' => 'Baseline awal', 'isControl' => true, 'targetVisit' => 100, 'realVisit' => 90, 'bounceRate' => 40, 'leadRate' => 3, 'intentRate' => 8],
                ['id' => 'temp-b', 'label' => 'Varian A', 'isControl' => false, 'targetVisit' => 100, 'realVisit' => 95, 'bounceRate' => 35, 'leadRate' => 5, 'intentRate' => 10],
            ],
        ])->assertRedirect();
        $this->assertDatabaseCount('cycle_variants', 2);

        $this->actingAs($coo)->post('/feedback', [
            'client' => $client->id, 'date' => '2026-09-20', 'phase' => 30,
            'from' => 'COO', 'fromType' => 'owner', 'topic' => 'Database feedback',
            'details' => 'Persisted feedback', 'priority' => 2, 'action' => '',
        ])->assertRedirect();
        $feedback = Feedback::where('topic', 'Database feedback')->firstOrFail();
        $this->actingAs($coo)->patch("/feedback/{$feedback->id}/action", ['action' => 'Selesai'])->assertRedirect();
        $this->assertDatabaseHas('feedback', ['id' => $feedback->id, 'action' => 'Selesai']);

        $this->actingAs($coo)->delete("/clients/{$client->id}")->assertRedirect();
        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
        $this->assertDatabaseMissing('feedback', ['id' => $feedback->id]);
        $this->assertDatabaseCount('cycle_variants', 0);
    }

    public function test_permission_matrix_is_enforced_on_server(): void
    {
        $client = Client::create(['id' => 'permission-client', 'name' => 'Permission Client', 'contract' => 'Retainer', 'bottleneck' => '']);
        $feedback = Feedback::create(['id' => 'permission-feedback', 'client_id' => $client->id, 'date' => '2026-09-20', 'phase' => 30, 'from' => 'COO', 'from_type' => 'owner', 'topic' => 'Permission', 'details' => 'Permission', 'priority' => 2, 'action' => '']);

        foreach (['coo@gmail.com', 'projectmanager@gmail.com'] as $email) {
            $this->actingAs(User::where('email', $email)->firstOrFail())
                ->post('/tasks', $this->taskPayload($client->id, "Task {$email}"))->assertRedirect();
        }

        foreach (['developer@gmail.com', 'creative@gmail.com', 'digitalmarketer@gmail.com'] as $email) {
            $this->actingAs(User::where('email', $email)->firstOrFail())
                ->patch("/feedback/{$feedback->id}/action", ['action' => $email])->assertRedirect();
        }

        $digitalMarketer = User::where('email', 'digitalmarketer@gmail.com')->firstOrFail();
        $this->actingAs($digitalMarketer)->post('/cycles', [
            'client' => $client->id, 'cycle' => 1, 'periode' => 'Sep 2026', 'updateDate' => '2026-09-20',
            'status' => 'Improving', 'layer' => '', 'bottleneck' => '', 'primaryMetric' => 'Lead Rate',
            'hypothesis' => '', 'optimization' => '',
            'variants' => [['id' => 'x', 'label' => 'Varian 1', 'isControl' => true, 'targetVisit' => 1, 'realVisit' => 1, 'bounceRate' => 1, 'leadRate' => 1, 'intentRate' => 1]],
        ])->assertRedirect();
        $this->actingAs($digitalMarketer)->post('/tasks', $this->taskPayload($client->id, 'Forbidden task'))->assertForbidden();

        foreach (['developer@gmail.com', 'creative@gmail.com', 'cmo@gmail.com', 'marketingmanager@gmail.com', 'contentspecialist@gmail.com', 'appointmentsetter@gmail.com'] as $email) {
            $this->actingAs(User::where('email', $email)->firstOrFail())
                ->delete("/clients/{$client->id}")->assertForbidden();
        }
    }

    public function test_quick_task_uses_short_workflow_and_multiple_assignees(): void
    {
        $coo = User::where('email', 'coo@gmail.com')->firstOrFail();
        $client = Client::create(['id' => 'quick-client', 'name' => 'Quick Client', 'contract' => 'Retainer', 'bottleneck' => '']);

        $payload = $this->taskPayload($client->id, 'Quick performance fix');
        $payload['workflow'] = 'quick';
        $payload['status'] = 'in-progress';
        $this->actingAs($coo)->post('/tasks', $payload)->assertRedirect();

        $task = Task::where('name', 'Quick performance fix')->firstOrFail();
        $this->assertSame('quick', $task->workflow);
        $this->assertCount(2, $task->assignees);

        $this->actingAs($coo)
            ->patch("/tasks/{$task->id}/status", ['status' => 'validation'])
            ->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'validation']);

        $this->actingAs($coo)
            ->patch("/tasks/{$task->id}/status", ['status' => 'strategy'])
            ->assertSessionHasErrors('status');
    }

    private function taskPayload(string $client, string $name = 'Database Task'): array
    {
        return [
            'client' => $client, 'name' => $name, 'workflow' => 'standard', 'status' => 'intake',
            'pics' => ['developer', 'creative'],
            'due' => '2026-09-20', 'cycle' => 1, 'revision' => 0, 'priority' => 'normal',
            'type' => 'feature', 'brief' => 'Persisted task', 'blocked' => false,
        ];
    }
}
