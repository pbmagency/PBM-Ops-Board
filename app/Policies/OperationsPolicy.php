<?php

namespace App\Policies;

use App\Models\User;

class OperationsPolicy
{
    public function manage(User $user): bool
    {
        return $user->active && $user->role->isOperationsManager();
    }

    public function manageCycles(User $user): bool
    {
        return $user->active && $user->role->canManageCycles();
    }

    public function updateFeedbackAction(User $user): bool
    {
        return $user->active && $user->role->canUpdateFeedbackAction();
    }
}
