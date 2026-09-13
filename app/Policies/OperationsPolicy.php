<?php

namespace App\Policies;

use App\Models\User;

class OperationsPolicy
{
    public function manageClients(User $user): bool
    {
        return $user->hasAbility('clients.manage');
    }

    public function manageTasks(User $user): bool
    {
        return $user->hasAbility('tasks.manage');
    }

    public function manageCycles(User $user): bool
    {
        return $user->hasAbility('cycles.manage');
    }

    public function manageFeedback(User $user): bool
    {
        return $user->hasAbility('feedback.manage');
    }

    public function updateFeedbackAction(User $user): bool
    {
        return $user->hasAbility('feedback.update_action');
    }

    public function manageUsers(User $user): bool
    {
        return $user->hasAbility('users.manage');
    }

    public function manageRolePermissions(User $user): bool
    {
        return $user->hasAbility('role_permissions.manage');
    }
}
