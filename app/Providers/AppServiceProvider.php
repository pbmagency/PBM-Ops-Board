<?php

namespace App\Providers;

use App\Policies\OperationsPolicy;
use App\Policies\TeamPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::define('manage-operations', [OperationsPolicy::class, 'manage']);
        Gate::define('manage-cycles', [OperationsPolicy::class, 'manageCycles']);
        Gate::define('update-feedback-action', [OperationsPolicy::class, 'updateFeedbackAction']);
        Gate::define('manage-team-kpi-definitions', [TeamPolicy::class, 'manageDefinitions']);
        Gate::define('save-own-team-report', [TeamPolicy::class, 'saveOwnReport']);
    }
}
