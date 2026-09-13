<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamReportMetric extends Model
{
    protected $fillable = ['team_report_id', 'definition_id', 'metric_key', 'name', 'target', 'high', 'unit', 'direction', 'period', 'value', 'position'];

    protected function casts(): array
    {
        return ['target' => 'float', 'high' => 'float', 'value' => 'float', 'position' => 'integer'];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(TeamReport::class, 'team_report_id');
    }

    public function definition(): BelongsTo
    {
        return $this->belongsTo(TeamKpiDefinition::class, 'definition_id');
    }
}
