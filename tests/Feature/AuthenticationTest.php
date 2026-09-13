<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_user_can_log_in_and_log_out(): void
    {
        $this->seed(RoleUserSeeder::class);

        $this->post('/login', [
            'email' => 'projectmanager@gmail.com',
            'password' => 'password',
        ])->assertRedirect('/');

        $this->assertAuthenticatedAs(User::where('email', 'projectmanager@gmail.com')->firstOrFail());

        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_inactive_user_cannot_log_in(): void
    {
        $this->seed(RoleUserSeeder::class);
        User::where('email', 'developer@gmail.com')->update(['active' => false]);

        $this->from('/')->post('/login', [
            'email' => 'developer@gmail.com',
            'password' => 'password',
        ])->assertRedirect('/')->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_logged_in_user_is_logged_out_after_account_is_deactivated(): void
    {
        $this->seed(RoleUserSeeder::class);
        $user = User::where('email', 'developer@gmail.com')->firstOrFail();
        $this->actingAs($user);
        $user->update(['active' => false]);

        $this->get('/')->assertRedirect('/')->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
