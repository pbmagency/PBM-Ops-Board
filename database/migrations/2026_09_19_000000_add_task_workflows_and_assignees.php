<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('workflow')->default('standard')->after('name')->index();
        });

        Schema::create('task_assignees', function (Blueprint $table) {
            $table->id();
            $table->string('task_id');
            $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete();
            $table->string('role')->index();
            $table->timestamps();
            $table->unique(['task_id', 'role']);
        });

        DB::table('tasks')->orderBy('id')->each(function (object $task): void {
            DB::table('task_assignees')->insert([
                'task_id' => $task->id,
                'role' => $task->pic,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_assignees');

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('workflow');
        });
    }
};
