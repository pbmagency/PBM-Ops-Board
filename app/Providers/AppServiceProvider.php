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
        Gate::define('manage-clients', [OperationsPolicy::class, 'manageClients']);
        Gate::define('manage-tasks', [OperationsPolicy::class, 'manageTasks']);
        Gate::define('manage-cycles', [OperationsPolicy::class, 'manageCycles']);
        Gate::define('manage-feedback', [OperationsPolicy::class, 'manageFeedback']);
        Gate::define('update-feedback-action', [OperationsPolicy::class, 'updateFeedbackAction']);
        Gate::define('manage-users', [OperationsPolicy::class, 'manageUsers']);
        Gate::define('manage-role-permissions', [OperationsPolicy::class, 'manageRolePermissions']);
        Gate::define('manage-team-kpi-definitions', [TeamPolicy::class, 'manageDefinitions']);
        Gate::define('save-own-team-report', [TeamPolicy::class, 'saveOwnReport']);
    }
}
