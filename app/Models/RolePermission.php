<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'role';

    protected $keyType = 'string';

    protected $fillable = ['role', 'tabs', 'abilities', 'report_roles'];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'tabs' => 'array',
            'abilities' => 'array',
            'report_roles' => 'array',
        ];
    }

    public static function forRole(UserRole|string $role): self
    {
        $role = $role instanceof UserRole ? $role : UserRole::from($role);

        return static::query()->find($role->value) ?? new static([
            'role' => $role,
            'tabs' => $role->defaultTabs(),
            'abilities' => $role->defaultAbilities(),
            'report_roles' => $role->defaultReadableTeamRoles(),
        ]);
    }

    public function allowsTab(string $tab): bool
    {
        return in_array($tab, $this->tabs ?? [], true);
    }

    public function allows(string $ability): bool
    {
        return in_array($ability, $this->abilities ?? [], true);
    }

    /** @return list<string> */
    public function readableTeamRoles(): array
    {
        return $this->report_roles ?? [];
    }

    public function payload(): array
    {
        return [
            'role' => $this->role instanceof UserRole ? $this->role->value : $this->role,
            'tabs' => array_values($this->tabs ?? []),
            'abilities' => array_values($this->abilities ?? []),
            'reportRoles' => array_values($this->report_roles ?? []),
        ];
    }
}
