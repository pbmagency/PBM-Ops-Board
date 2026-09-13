<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamKpiDefinition extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'role', 'name', 'target', 'high', 'unit', 'direction', 'period', 'effective', 'active'];

    protected function casts(): array
    {
        return [
            'target' => 'float',
            'high' => 'float',
            'effective' => 'date:Y-m-d',
            'active' => 'boolean',
        ];
    }

    public function reportMetrics(): HasMany
    {
        return $this->hasMany(TeamReportMetric::class, 'definition_id');
    }
}
