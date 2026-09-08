<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name')->unique();
            $table->string('contract');
            $table->text('bottleneck')->nullable();
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('client_id');
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            $table->string('name');
            $table->string('status')->index();
            $table->string('pic')->index();
            $table->date('due')->index();
            $table->unsignedInteger('cycle')->default(0);
            $table->unsignedInteger('revision')->default(0);
            $table->string('priority')->default('normal');
            $table->string('type')->default('feature');
            $table->text('brief')->nullable();
            $table->boolean('blocked')->default(false);
            $table->timestamps();
        });

        Schema::create('cycles', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('client_id');
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            $table->unsignedInteger('cycle');
            $table->string('periode');
            $table->date('update_date');
            $table->string('status');
            $table->string('layer')->nullable();
            $table->text('bottleneck')->nullable();
            $table->string('primary_metric')->default('Lead Rate');
            $table->text('hypothesis')->nullable();
            $table->text('optimization')->nullable();
            $table->timestamps();
            $table->unique(['client_id', 'cycle']);
        });

        Schema::create('cycle_variants', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('cycle_id');
            $table->foreign('cycle_id')->references('id')->on('cycles')->cascadeOnDelete();
            $table->string('label');
            $table->boolean('is_control')->default(false);
            $table->unsignedInteger('target_visit')->nullable();
            $table->unsignedInteger('real_visit')->nullable();
            $table->decimal('bounce_rate', 7, 4)->nullable();
            $table->decimal('lead_rate', 7, 4)->nullable();
            $table->decimal('intent_rate', 7, 4)->nullable();
            $table->timestamps();
            $table->unique(['cycle_id', 'label']);
        });

        Schema::create('feedback', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('client_id');
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            $table->date('date')->index();
            $table->unsignedTinyInteger('phase');
            $table->string('from');
            $table->string('from_type');
            $table->string('topic');
            $table->text('details');
            $table->unsignedTinyInteger('priority');
            $table->text('action')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('cycle_variants');
        Schema::dropIfExists('cycles');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('clients');
    }
};
