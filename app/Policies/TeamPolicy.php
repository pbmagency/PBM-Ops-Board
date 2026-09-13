<?php

namespace App\Policies;

use App\Models\TeamReport;
use App\Models\User;

class TeamPolicy
{
    public function manageDefinitions(User $user): bool
    {
        return $user->active && $user->role->value === 'coo';
    }

    public function saveOwnReport(User $user, int $ownerId): bool
    {
        return $user->active && $user->id === $ownerId;
    }

    public function viewReport(User $user, TeamReport $report): bool
    {
        if (! $user->active) {
            return false;
        }

        if ($user->id === $report->user_id) {
            return true;
        }

        $roles = $user->role->readableTeamRoles();

        return $roles === null || in_array($report->role, array_map(fn ($role) => $role->value, $roles), true);
    }
}
