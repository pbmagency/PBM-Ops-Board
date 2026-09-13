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

    public function test_coo_and_project_manager_can_manage_users_and_assign_roles(): void
    {
        foreach (['coo@gmail.com', 'projectmanager@gmail.com'] as $index => $email) {
            $manager = User::where('email', $email)->firstOrFail();
            $newEmail = "qa.team{$index}@gmail.com";
            $this->actingAs($manager)->post('/users', [
                'name' => 'QA Team', 'email' => $newEmail, 'password' => 'password123',
                'role' => UserRole::Developer->value, 'active' => true,
            ])->assertRedirect();

            $created = User::where('email', $newEmail)->firstOrFail();
            $this->actingAs($manager)->put("/users/{$created->id}", [
                'name' => 'Creative Team', 'email' => $newEmail, 'password' => '',
                'role' => UserRole::Creative->value, 'active' => false,
            ])->assertRedirect();
            $this->assertDatabaseHas('users', ['id' => $created->id, 'role' => 'creative', 'active' => false]);

            $this->actingAs($manager)->delete("/users/{$created->id}")->assertRedirect();
            $this->assertDatabaseMissing('users', ['id' => $created->id]);
        }
    }

    public function test_delivery_role_cannot_manage_users(): void
    {
        $developer = User::where('email', 'developer@gmail.com')->firstOrFail();
        $this->actingAs($developer)->post('/users', [
            'name' => 'Blocked', 'email' => 'blocked@gmail.com', 'password' => 'password123',
            'role' => UserRole::Developer->value, 'active' => true,
        ])->assertForbidden();
    }

    public function test_last_active_coo_and_current_session_are_protected(): void
    {
        $coo = User::where('email', 'coo@gmail.com')->firstOrFail();
        $payload = ['name' => 'COO', 'email' => $coo->email, 'password' => '', 'role' => UserRole::COO->value, 'active' => false];

        $this->actingAs($coo)->from('/')->put("/users/{$coo->id}", $payload)->assertRedirect('/')->assertSessionHasErrors('role');
        $this->actingAs($coo)->from('/')->delete("/users/{$coo->id}")->assertRedirect('/')->assertSessionHasErrors('user');
    }
}
