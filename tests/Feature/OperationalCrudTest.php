<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationalCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_coo_crud_is_persisted_and_client_delete_cascades(): void
    {
        $this->seed(RoleUserSeeder::class);
        $coo = User::where('email', 'coo@gmail.com')->firstOrFail();

        $client = $this->actingAs($coo)->postJson('/clients', [
            'name' => 'Database Client', 'contract' => 'Project-Based', 'bottleneck' => '',
        ])->assertCreated()->json('record');

        $task = $this->actingAs($coo)->postJson('/tasks', [
            'client' => $client['id'], 'name' => 'Database Task', 'status' => 'intake',
            'pic' => 'developer', 'due' => '2026-09-20', 'cycle' => 1, 'revision' => 0,
            'priority' => 'normal', 'type' => 'feature', 'brief' => 'Persisted task', 'blocked' => false,
        ])->assertCreated()->json('record');

        $this->actingAs($coo)->putJson('/tasks/'.$task['id'], [
            ...$task, 'status' => 'done',
        ])->assertOk()->assertJsonPath('record.status', 'done');

        $cycle = $this->actingAs($coo)->postJson('/cycles', [
            'client' => $client['id'], 'cycle' => 1, 'periode' => 'Sep 2026',
            'updateDate' => '2026-09-20', 'status' => 'Improving', 'layer' => 'Hero',
            'bottleneck' => '', 'primaryMetric' => 'Lead Rate', 'hypothesis' => 'Test', 'optimization' => 'Run',
            'variants' => [
                ['id' => 'temp-a', 'label' => 'Control', 'isControl' => true, 'targetVisit' => 100, 'realVisit' => 90, 'bounceRate' => 40, 'leadRate' => 3, 'intentRate' => 8],
                ['id' => 'temp-b', 'label' => 'Variant A', 'isControl' => false, 'targetVisit' => 100, 'realVisit' => 95, 'bounceRate' => 35, 'leadRate' => 5, 'intentRate' => 10],
            ],
        ])->assertCreated()->json('record');
        $this->assertCount(2, $cycle['variants']);

        $feedback = $this->actingAs($coo)->postJson('/feedback', [
            'client' => $client['id'], 'date' => '2026-09-20', 'phase' => 30,
            'from' => 'COO', 'fromType' => 'owner', 'topic' => 'Database feedback',
            'details' => 'Persisted feedback', 'priority' => 2, 'action' => '',
        ])->assertCreated()->json('record');
        $this->actingAs($coo)->patchJson('/feedback/'.$feedback['id'].'/action', ['action' => 'Selesai'])
            ->assertOk()->assertJsonPath('record.action', 'Selesai');

        $this->actingAs($coo)->getJson('/operations')->assertOk()
            ->assertJsonCount(1, 'operations.clients')
            ->assertJsonCount(1, 'operations.tasks')
            ->assertJsonCount(1, 'operations.cycles')
            ->assertJsonCount(1, 'operations.feedback');

        $this->actingAs($coo)->deleteJson('/clients/'.$client['id'])->assertOk();
        $this->assertDatabaseCount('clients', 0);
        $this->assertDatabaseCount('tasks', 0);
        $this->assertDatabaseCount('cycles', 0);
        $this->assertDatabaseCount('cycle_variants', 0);
        $this->assertDatabaseCount('feedback', 0);
    }
}
