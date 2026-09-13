<?php

namespace App\Policies;

use App\Models\TeamReport;
use App\Models\User;

class TeamPolicy
{
    public function manageDefinitions(User $user): bool
    {
        return $user->hasAbility('team_kpi.manage');
    }

    public function saveOwnReport(User $user, int $ownerId): bool
    {
        return $user->id === $ownerId && $user->hasAbility('team_reports.submit');
    }

    public function viewReport(User $user, TeamReport $report): bool
    {
        if (! $user->active) {
            return false;
        }

        if ($user->id === $report->user_id) {
            return true;
        }

        return in_array($report->role, $user->readableTeamRoles(), true);
    }
}
