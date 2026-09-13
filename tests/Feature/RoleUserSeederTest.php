<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RoleUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_one_active_auth_user_for_each_role(): void
    {
        $this->seed(RoleUserSeeder::class);

        $this->assertDatabaseCount('users', 9);
        $this->assertEqualsCanonicalizing(
            UserRole::cases(),
            User::query()->pluck('role')->all(),
        );

        User::query()->each(function (User $user): void {
            $this->assertTrue($user->active);
            $this->assertNotNull($user->email_verified_at);
            $this->assertTrue(Hash::check('password', $user->password));
        });
    }

    public function test_it_can_be_run_repeatedly_without_duplicate_users(): void
    {
        $this->seed(RoleUserSeeder::class);
        $this->seed(RoleUserSeeder::class);

        $this->assertDatabaseCount('users', 9);
    }
}
