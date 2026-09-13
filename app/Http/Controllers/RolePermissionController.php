<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\RolePermissionRequest;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class RolePermissionController
{
    public function update(RolePermissionRequest $request, string $role): RedirectResponse
    {
        Gate::authorize('manage-role-permissions');
        $role = UserRole::tryFrom($role);
        abort_unless($role, 404);

        $data = $request->validated();
        $reportRoles = array_values(array_unique([$role->value, ...$data['reportRoles']]));
        $profiles = collect(UserRole::cases())->mapWithKeys(function (UserRole $item) use ($role, $data, $reportRoles) {
            $profile = RolePermission::forRole($item);

            return [$item->value => $item === $role ? [
                'tabs' => $data['tabs'],
                'abilities' => $data['abilities'],
                'report_roles' => $reportRoles,
            ] : [
                'tabs' => $profile->tabs,
                'abilities' => $profile->abilities,
                'report_roles' => $profile->report_roles,
            ]];
        });

        $hasPermissionManager = User::query()->where('active', true)->get()->contains(function (User $user) use ($profiles) {
            $profile = $profiles->get($user->role->value);

            return in_array('users', $profile['tabs'], true)
                && in_array('role_permissions.manage', $profile['abilities'], true);
        });
        if (! $hasPermissionManager) {
            throw ValidationException::withMessages([
                'abilities' => 'Minimal satu role dengan user aktif harus tetap dapat membuka Users & Roles dan mengelola permission.',
            ]);
        }

        RolePermission::query()->updateOrCreate(
            ['role' => $role->value],
            ['tabs' => array_values($data['tabs']), 'abilities' => array_values($data['abilities']), 'report_roles' => $reportRoles],
        );

        return back()->with('success', "Permission {$role->value} berhasil diperbarui.");
    }

    public static function payload(?User $user): array
    {
        if (! $user) {
            return ['current' => null, 'roles' => []];
        }

        return [
            'current' => $user->permissionProfile()->payload(),
            'roles' => $user->hasAbility('role_permissions.manage')
                ? array_map(fn (UserRole $role) => RolePermission::forRole($role)->payload(), UserRole::cases())
                : [],
        ];
    }
}
