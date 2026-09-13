<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    public function __invoke(Request $request, OperationsController $operations, TeamPerformanceController $team): Response
    {
        $user = $request->user();

        return Inertia::render('PbmOps', [
            'users' => $team->visibleUsers($user),
            'operations' => $operations->allData($user),
            'team' => $team->allData($user),
            'permissions' => RolePermissionController::payload($user),
        ]);
    }
}
