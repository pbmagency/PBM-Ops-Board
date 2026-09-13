<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'COO', 'email' => 'coo@gmail.com', 'role' => UserRole::COO],
            ['name' => 'Project Manager', 'email' => 'projectmanager@gmail.com', 'role' => UserRole::ProjectManager],
            ['name' => 'Developer', 'email' => 'developer@gmail.com', 'role' => UserRole::Developer],
            ['name' => 'Creative', 'email' => 'creative@gmail.com', 'role' => UserRole::Creative],
            ['name' => 'Digital Marketer', 'email' => 'digitalmarketer@gmail.com', 'role' => UserRole::DigitalMarketer],
            ['name' => 'CMO', 'email' => 'cmo@gmail.com', 'role' => UserRole::CMO],
            ['name' => 'Marketing Manager', 'email' => 'marketingmanager@gmail.com', 'role' => UserRole::MarketingManager],
            ['name' => 'Content Specialist', 'email' => 'contentspecialist@gmail.com', 'role' => UserRole::ContentSpecialist],
            ['name' => 'Appointment Setter', 'email' => 'appointmentsetter@gmail.com', 'role' => UserRole::AppointmentSetter],
        ];

        foreach ($users as $user) {
            User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                    'role' => $user['role'],
                    'active' => true,
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
