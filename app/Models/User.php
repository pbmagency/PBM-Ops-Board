<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const DEMO_EMAILS = [
        'coo@gmail.com',
        'projectmanager@gmail.com',
        'developer@gmail.com',
        'creative@gmail.com',
        'digitalmarketer@gmail.com',
        'cmo@gmail.com',
        'marketingmanager@gmail.com',
        'contentspecialist@gmail.com',
        'appointmentsetter@gmail.com',
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'active' => 'boolean',
        ];
    }

    public function teamReports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TeamReport::class);
    }

    public function permissionProfile(): RolePermission
    {
        return RolePermission::forRole($this->role);
    }

    public function canAccessTab(string $tab): bool
    {
        return $this->active && $this->permissionProfile()->allowsTab($tab);
    }

    public function hasAbility(string $ability): bool
    {
        return $this->active && $this->permissionProfile()->allows($ability);
    }

    /** @return list<string> */
    public function readableTeamRoles(): array
    {
        return $this->permissionProfile()->readableTeamRoles();
    }
}
