<?php

namespace Tests\Feature;

use App\Http\Controllers\OperationsController;
use App\Http\Controllers\TeamPerformanceController;
use App\Models\Client;
use App\Models\RolePermission;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RoleUserSeeder;
use Database\Seeders\TeamPerformanceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleUserSeeder::class);
        $this->seed(TeamPerformanceSeeder::class);
    }

    public function test_tabs_and_abilities_can_be_changed_per_role_and_are_enforced_on_server(): void
    {
        $coo = $this->user('coo@gmail.com');
        $developer = $this->user('developer@gmail.com');
        $payload = [
            'tabs' => ['board', 'hub', 'team', 'feedback', 'clients'],
            'abilities' => ['clients.manage', 'feedback.update_action', 'team_reports.submit'],
            'reportRoles' => ['developer', 'creative'],
        ];

        $this->actingAs($coo)->put('/role-permissions/developer', $payload)->assertRedirect();

        $profile = RolePermission::forRole('developer');
        $this->assertTrue($profile->allowsTab('hub'));
        $this->assertTrue($profile->allows('clients.manage'));
        $this->assertContains('developer', $profile->readableTeamRoles());
        $this->assertContains('creative', $profile->readableTeamRoles());

        $this->actingAs($developer)->post('/clients', [
            'name' => 'Dynamic Permission Client', 'contract' => 'Retainer', 'bottleneck' => '',
        ])->assertRedirect();
        $this->assertDatabaseHas('clients', ['name' => 'Dynamic Permission Client']);
        $client = Client::where('name', 'Dynamic Permission Client')->firstOrFail();
        Task::create([
            'id' => 'dynamic-task', 'client_id' => $client->id, 'name' => 'Visible task', 'status' => 'intake',
            'workflow' => 'standard', 'pic' => 'developer', 'due' => '2026-09-20', 'cycle' => 1, 'revision' => 0,
            'priority' => 'normal', 'type' => 'feature', 'brief' => '', 'blocked' => false,
        ]);

        $operations = app(OperationsController::class)->allData($developer);
        $this->assertNotEmpty($operations['tasks']);
        $this->assertEmpty($operations['cycles']);

        $reports = collect(app(TeamPerformanceController::class)->allData($developer)['reports']);
        $this->assertTrue($reports->contains('role', 'creative'));
        $this->assertTrue($reports->every(fn ($report) => in_array($report['role'], ['developer', 'creative'], true)));
    }

    public function test_only_permission_manager_can_update_roles_and_last_manager_is_protected(): void
    {
        $developer = $this->user('developer@gmail.com');
        $coo = $this->user('coo@gmail.com');
        $projectManager = $this->user('projectmanager@gmail.com');
        $payload = [
            'tabs' => ['board', 'team'],
            'abilities' => ['team_reports.submit'],
            'reportRoles' => ['developer'],
        ];

        $this->actingAs($developer)->put('/role-permissions/developer', $payload)->assertForbidden();
        $this->actingAs($coo)->put('/role-permissions/project-manager', $payload)->assertRedirect();
        $this->actingAs($coo)->put('/role-permissions/coo', [
            'tabs' => ['board', 'team'],
            'abilities' => ['team_reports.submit'],
            'reportRoles' => ['coo'],
        ])->assertSessionHasErrors('abilities');

        $this->assertTrue(RolePermission::forRole($projectManager->role)->allows('team_reports.submit'));
        $this->assertTrue(RolePermission::forRole('coo')->allows('role_permissions.manage'));
    }

    private function user(string $email): User
    {
        return User::where('email', $email)->firstOrFail();
    }
}
