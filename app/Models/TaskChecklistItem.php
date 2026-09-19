<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskChecklistItem extends Model
{
    protected $fillable = ['label', 'completed', 'position'];

    protected function casts(): array
    {
        return ['completed' => 'boolean', 'position' => 'integer'];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
