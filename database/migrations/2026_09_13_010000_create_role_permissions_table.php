<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->string('role')->primary();
            $table->json('tabs');
            $table->json('abilities');
            $table->json('report_roles');
            $table->timestamps();
        });

        $now = now();
        DB::table('role_permissions')->insert(array_map(fn (UserRole $role) => [
            'role' => $role->value,
            'tabs' => json_encode($role->defaultTabs(), JSON_THROW_ON_ERROR),
            'abilities' => json_encode($role->defaultAbilities(), JSON_THROW_ON_ERROR),
            'report_roles' => json_encode($role->defaultReadableTeamRoles(), JSON_THROW_ON_ERROR),
            'created_at' => $now,
            'updated_at' => $now,
        ], UserRole::cases()));
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
