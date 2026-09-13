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

    public function isOperationsManager(): bool
    {
        return in_array($this, [self::COO, self::ProjectManager], true);
    }

    public function canManageCycles(): bool
    {
        return $this->isOperationsManager() || $this === self::DigitalMarketer;
    }

    public function canUpdateFeedbackAction(): bool
    {
        return $this->isOperationsManager() || in_array($this, [
            self::Developer,
            self::Creative,
            self::DigitalMarketer,
        ], true);
    }

    /** @return list<UserRole>|null Null means every role. */
    public function readableTeamRoles(): ?array
    {
        return match ($this) {
            self::COO, self::ProjectManager => null,
            self::CMO => [
                self::CMO,
                self::MarketingManager,
                self::DigitalMarketer,
                self::ContentSpecialist,
                self::AppointmentSetter,
            ],
            self::MarketingManager => [
                self::MarketingManager,
                self::ContentSpecialist,
                self::AppointmentSetter,
            ],
            default => [$this],
        };
    }
}
