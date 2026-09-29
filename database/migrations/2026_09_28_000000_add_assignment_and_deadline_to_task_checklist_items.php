<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('task_checklist_items', function (Blueprint $table) {
            $table->string('pic_role')->nullable()->after('label');
            $table->date('due')->nullable()->after('pic_role');
            $table->date('completed_at')->nullable()->after('completed');
            $table->index(['pic_role', 'completed', 'due'], 'task_checklist_work_index');
        });

        $taskDefaults = DB::table('tasks')
            ->select(['id', 'pic', 'due'])
            ->get()
            ->keyBy('id');

        DB::table('task_checklist_items')->orderBy('id')->get()->each(function (object $item) use ($taskDefaults): void {
            $task = $taskDefaults->get($item->task_id);
            if (! $task) {
                return;
            }

            DB::table('task_checklist_items')->where('id', $item->id)->update([
                'pic_role' => $task->pic,
                'due' => $task->due,
                'completed_at' => $item->completed ? substr((string) $item->updated_at, 0, 10) : null,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('task_checklist_items', function (Blueprint $table) {
            $table->dropIndex('task_checklist_work_index');
            $table->dropColumn(['pic_role', 'due', 'completed_at']);
        });
    }
};
