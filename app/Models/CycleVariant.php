<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CycleVariant extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'cycle_id', 'label', 'is_control', 'target_visit', 'real_visit', 'bounce_rate', 'lead_rate', 'intent_rate'];
    protected function casts(): array { return ['is_control' => 'boolean', 'target_visit' => 'integer', 'real_visit' => 'integer', 'bounce_rate' => 'float', 'lead_rate' => 'float', 'intent_rate' => 'float']; }
}
