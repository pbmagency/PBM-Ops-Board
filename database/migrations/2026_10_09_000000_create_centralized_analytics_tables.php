<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('centralized_analytics', function (Blueprint $table) {
            $table->id();
            $table->string('project_key', 50)->index();
            $table->string('session_id', 100)->index();
            $table->string('event_type', 50)->index();
            $table->json('event_data')->nullable();
            $table->string('referral_source')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamp('synced_at')->useCurrent();

            $table->index(['project_key', 'occurred_at']);
            $table->index(['project_key', 'event_type', 'occurred_at']);
            $table->index(['project_key', 'session_id', 'occurred_at']);
            $table->index(['referral_source', 'occurred_at']);
        });

        Schema::create('project_sync_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('project_key', 50)->unique();
            $table->string('project_name', 100);
            $table->timestamp('last_synced_at')->nullable();
            $table->unsignedBigInteger('total_events_synced')->default(0);
            $table->unsignedInteger('last_batch_count')->default(0);
            $table->string('last_status', 20)->default('idle'); // idle, success, error
            $table->text('last_error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('centralized_analytics');
        Schema::dropIfExists('project_sync_statuses');
    }
};
