<?php

namespace Tests\Feature;

use Database\Seeders\RoleUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_is_available(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('PbmOps'));
    }

    public function test_guest_can_see_the_fixed_demo_accounts(): void
    {
        $this->seed(RoleUserSeeder::class);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('PbmOps')
                ->has('users', 9)
                ->where('users.0.email', 'coo@gmail.com'));
    }
}
