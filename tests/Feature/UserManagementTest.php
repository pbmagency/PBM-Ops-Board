<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RoleUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleUserSeeder::class);
    }

    public function test_coo_can_create_update_and_delete_a_user(): void
    {
        $coo = User::where('email', 'coo@gmail.com')->firstOrFail();

        $created = $this->actingAs($coo)->postJson('/users', [
            'email' => 'qa.team@gmail.com',
            'password' => 'password123',
            'role' => UserRole::Developer->value,
            'active' => true,
        ])->assertCreated()->json('user');

        $this->actingAs($coo)->putJson('/users/'.$created['id'], [
            'email' => 'qa.team@gmail.com',
            'password' => '',
            'role' => UserRole::Creative->value,
            'active' => false,
        ])->assertOk()->assertJsonPath('user.role', UserRole::Creative->value);

        $this->actingAs($coo)->deleteJson('/users/'.$created['id'])->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $created['id']]);
    }

    public function test_non_coo_cannot_manage_users(): void
    {
        $manager = User::where('email', 'projectmanager@gmail.com')->firstOrFail();
        $this->actingAs($manager)->postJson('/users', [
            'email' => 'blocked@gmail.com',
            'password' => 'password123',
            'role' => UserRole::Developer->value,
            'active' => true,
        ])->assertForbidden();
    }

    public function test_last_active_coo_cannot_be_deactivated_or_deleted(): void
    {
        $coo = User::where('email', 'coo@gmail.com')->firstOrFail();
        $payload = ['email' => $coo->email, 'password' => '', 'role' => UserRole::COO->value, 'active' => false];

        $this->actingAs($coo)->putJson('/users/'.$coo->id, $payload)->assertUnprocessable();
        $this->actingAs($coo)->deleteJson('/users/'.$coo->id)->assertUnprocessable();
    }
}
