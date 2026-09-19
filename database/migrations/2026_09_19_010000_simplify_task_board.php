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
            $table->string('legacy_status')->nullable()->after('status');
        });

        Schema::create('task_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->string('task_id');
            $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete();
            $table->string('label');
            $table->boolean('completed')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->index(['task_id', 'position']);
        });

        $buildTemplate = [
            'Strategy & Copy',
            'Design & Backend',
            'Frontend',
            'Staging',
            'Internal QA',
            'Client Review',
            'Launch',
        ];
        $stageIndex = [
            'intake' => 0,
            'strategy' => 0,
            'design' => 1,
            'frontend' => 2,
            'staging' => 3,
            'qa' => 4,
            'review' => 5,
            'done' => 7,
        ];
        $statusMap = [
            'strategy' => 'in-progress',
            'design' => 'in-progress',
            'frontend' => 'in-progress',
            'staging' => 'review',
            'qa' => 'review',
            'validation' => 'review',
        ];

        DB::table('tasks')->orderBy('id')->each(function (object $task) use ($buildTemplate, $stageIndex, $statusMap): void {
            $workType = $task->workflow === 'quick' ? 'quick' : 'build';
            if ($workType === 'build') {
                foreach ($buildTemplate as $position => $label) {
                    DB::table('task_checklist_items')->insert([
                        'task_id' => $task->id,
                        'label' => $label,
                        'completed' => $position < ($stageIndex[$task->status] ?? 0),
                        'position' => $position,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::table('tasks')->where('id', $task->id)->update([
                'legacy_status' => $task->status,
                'workflow' => $workType,
                'status' => $statusMap[$task->status] ?? $task->status,
            ]);
        });
    }

    public function down(): void
    {
        DB::table('tasks')->whereNotNull('legacy_status')->orderBy('id')->each(function (object $task): void {
            DB::table('tasks')->where('id', $task->id)->update([
                'status' => $task->legacy_status,
                'workflow' => $task->workflow === 'quick' ? 'quick' : 'standard',
            ]);
        });

        Schema::dropIfExists('task_checklist_items');
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('legacy_status');
        });
    }
};
