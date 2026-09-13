<?php

namespace Tests\Feature;

use App\Http\Controllers\TeamPerformanceController;
use App\Models\TeamKpiDefinition;
use App\Models\User;
use Database\Seeders\RoleUserSeeder;
use Database\Seeders\TeamPerformanceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TeamPerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleUserSeeder::class);
        $this->seed(TeamPerformanceSeeder::class);
    }

    public function test_report_history_follows_the_management_hierarchy(): void
    {
        $controller = app(TeamPerformanceController::class);

        $cooRoles = collect($controller->allData($this->user('coo@gmail.com'))['reports'])->pluck('role')->unique()->sort()->values()->all();
        $this->assertEqualsCanonicalizing(array_column(\App\Enums\UserRole::cases(), 'value'), $cooRoles);

        $cmoRoles = collect($controller->allData($this->user('cmo@gmail.com'))['reports'])->pluck('role')->unique()->sort()->values()->all();
        $this->assertEqualsCanonicalizing(['cmo', 'marketing-manager', 'digital-marketer', 'content-specialist', 'appointment-setter'], $cmoRoles);

        $managerRoles = collect($controller->allData($this->user('marketingmanager@gmail.com'))['reports'])->pluck('role')->unique()->sort()->values()->all();
        $this->assertEqualsCanonicalizing(['marketing-manager', 'content-specialist', 'appointment-setter'], $managerRoles);

        $developer = $this->user('developer@gmail.com');
        $developerReports = collect($controller->allData($developer)['reports']);
        $this->assertTrue($developerReports->every(fn ($report) => $report['userId'] === $developer->id));
    }

    public function test_user_can_only_save_own_numeric_report(): void
    {
        $developer = $this->user('developer@gmail.com');
        $definition = TeamKpiDefinition::where('role', 'developer')->firstOrFail();
        $week = now('Asia/Jakarta')->startOfWeek()->format('Y-m-d');
        $payload = [
            'userId' => $developer->id, 'week' => $week,
            'metrics' => [['id' => $definition->id, 'value' => 95], ['id' => 'staging', 'value' => 90]],
            'summary' => 'Hasil utama', 'cause' => 'Penyebab', 'plan' => 'Rencana', 'decision' => 'Keputusan',
        ];

        $this->actingAs($developer)->post('/team-reports', $payload)->assertRedirect();
        $this->assertDatabaseHas('team_reports', ['user_id' => $developer->id, 'week' => $week, 'summary' => 'Hasil utama', 'demo' => false]);

        $creative = $this->user('creative@gmail.com');
        $this->actingAs($creative)->post('/team-reports', $payload)->assertForbidden();
    }

    public function test_only_authorized_role_can_manage_and_delete_dynamic_kpi_definitions(): void
    {
        $payload = [
            'id' => '', 'role' => 'developer', 'name' => 'Deployment Success Rate', 'target' => 98,
            'high' => null, 'unit' => '%', 'direction' => 'min', 'period' => 'weekly', 'effective' => null, 'active' => true,
        ];

        $this->actingAs($this->user('coo@gmail.com'))->post('/team-kpi-definitions', $payload)->assertRedirect();
        $definition = TeamKpiDefinition::where('name', 'Deployment Success Rate')->firstOrFail();
        $this->actingAs($this->user('coo@gmail.com'))->delete("/team-kpi-definitions/{$definition->id}")->assertRedirect();
        $this->assertDatabaseMissing('team_kpi_definitions', ['id' => $definition->id]);

        $historical = TeamKpiDefinition::where('role', 'developer')->firstOrFail();
        $snapshotCount = DB::table('team_report_metrics')->where('definition_id', $historical->id)->count();
        $this->assertGreaterThan(0, $snapshotCount);
        $this->actingAs($this->user('coo@gmail.com'))->delete("/team-kpi-definitions/{$historical->id}")->assertRedirect();
        $this->assertSame($snapshotCount, DB::table('team_report_metrics')->whereNull('definition_id')->count());

        $this->actingAs($this->user('projectmanager@gmail.com'))->post('/team-kpi-definitions', [...$payload, 'name' => 'Forbidden'])->assertForbidden();
    }

    private function user(string $email): User
    {
        return User::where('email', $email)->firstOrFail();
    }
}
