<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->date('completed_at')->nullable()->after('due');
            $table->date('due_at_completion')->nullable()->after('completed_at');
        });

        Schema::create('task_status_events', function (Blueprint $table) {
            $table->id();
            $table->string('task_id');
            $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('due_snapshot');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['task_id', 'created_at']);
        });

        Schema::create('team_kpi_definitions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('role')->index();
            $table->string('name');
            $table->decimal('target', 15, 4)->nullable();
            $table->decimal('high', 15, 4)->nullable();
            $table->string('unit');
            $table->string('direction');
            $table->string('period');
            $table->date('effective');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('team_reports', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->index();
            $table->date('week')->index();
            $table->string('status')->default('saved');
            $table->text('summary')->nullable();
            $table->text('cause')->nullable();
            $table->text('plan')->nullable();
            $table->text('decision')->nullable();
            $table->boolean('demo')->default(false);
            $table->timestamps();
            $table->unique(['user_id', 'week']);
        });

        Schema::create('team_report_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('team_report_id');
            $table->foreign('team_report_id')->references('id')->on('team_reports')->cascadeOnDelete();
            $table->string('definition_id')->nullable();
            $table->foreign('definition_id')->references('id')->on('team_kpi_definitions')->nullOnDelete();
            $table->string('metric_key');
            $table->string('name');
            $table->decimal('target', 15, 4)->nullable();
            $table->decimal('high', 15, 4)->nullable();
            $table->string('unit');
            $table->string('direction');
            $table->string('period');
            $table->decimal('value', 15, 4)->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['team_report_id', 'metric_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_report_metrics');
        Schema::dropIfExists('team_reports');
        Schema::dropIfExists('team_kpi_definitions');
        Schema::dropIfExists('task_status_events');

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['completed_at', 'due_at_completion']);
        });
    }
};
