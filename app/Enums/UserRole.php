<?php

namespace App\Enums;

enum UserRole: string
{
    case COO = 'coo';
    case Developer = 'developer';
    case Creative = 'creative';
    case DigitalMarketer = 'digital-marketer';
    case ProjectManager = 'project-manager';
    case CMO = 'cmo';
    case MarketingManager = 'marketing-manager';
    case ContentSpecialist = 'content-specialist';
    case AppointmentSetter = 'appointment-setter';

    /** @return list<string> */
    public function defaultTabs(): array
    {
        return match ($this) {
            self::COO, self::ProjectManager => ['board', 'hub', 'kpi', 'team', 'feedback', 'clients', 'users'],
            self::Developer, self::Creative => ['board', 'team', 'feedback'],
            self::DigitalMarketer, self::CMO => ['board', 'kpi', 'team', 'feedback'],
            default => ['board', 'team', 'feedback'],
        };
    }

    /** @return list<string> */
    public function defaultAbilities(): array
    {
        return match ($this) {
            self::COO => [
                'clients.manage', 'tasks.manage', 'cycles.manage', 'feedback.manage', 'feedback.update_action',
                'users.manage', 'team_reports.submit', 'team_kpi.manage', 'role_permissions.manage',
            ],
            self::ProjectManager => [
                'clients.manage', 'tasks.manage', 'cycles.manage', 'feedback.manage', 'feedback.update_action',
                'users.manage', 'team_reports.submit', 'role_permissions.manage',
            ],
            self::DigitalMarketer => ['cycles.manage', 'feedback.update_action', 'team_reports.submit'],
            self::Developer, self::Creative => ['feedback.update_action', 'team_reports.submit'],
            default => ['team_reports.submit'],
        };
    }

    /** @return list<string> */
    public function defaultReadableTeamRoles(): array
    {
        return match ($this) {
            self::COO, self::ProjectManager => array_map(fn (self $role) => $role->value, self::cases()),
            self::CMO => [
                self::CMO->value,
                self::MarketingManager->value,
                self::DigitalMarketer->value,
                self::ContentSpecialist->value,
                self::AppointmentSetter->value,
            ],
            self::MarketingManager => [
                self::MarketingManager->value,
                self::ContentSpecialist->value,
                self::AppointmentSetter->value,
            ],
            default => [$this->value],
        };
    }
}
