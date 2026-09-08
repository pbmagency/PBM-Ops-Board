<?php

namespace App\Enums;

enum UserRole: string
{
    case COO = 'coo';
    case Developer = 'developer';
    case Creative = 'creative';
    case DigitalMarketer = 'digital-marketer';
    case ProjectManager = 'project-manager';
}
