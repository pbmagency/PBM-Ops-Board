<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RolePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roles = array_map(fn (UserRole $role) => $role->value, UserRole::cases());

        return [
            'tabs' => ['required', 'array', 'min:1'],
            'tabs.*' => ['string', 'distinct', Rule::in(['board', 'hub', 'kpi', 'team', 'feedback', 'clients', 'users'])],
            'abilities' => ['present', 'array'],
            'abilities.*' => ['string', 'distinct', Rule::in([
                'clients.manage', 'tasks.manage', 'cycles.manage', 'feedback.manage', 'feedback.update_action',
                'users.manage', 'team_reports.submit', 'team_kpi.manage', 'role_permissions.manage',
            ])],
            'reportRoles' => ['present', 'array'],
            'reportRoles.*' => ['string', 'distinct', Rule::in($roles)],
        ];
    }
}
