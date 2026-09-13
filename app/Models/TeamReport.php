<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamReport extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'user_id', 'role', 'week', 'status', 'summary', 'cause', 'plan', 'decision', 'demo'];

    protected function casts(): array
    {
        return ['week' => 'date:Y-m-d', 'demo' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(TeamReportMetric::class)->orderBy('position');
    }
}
