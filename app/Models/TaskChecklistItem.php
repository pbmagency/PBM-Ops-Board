<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskChecklistItem extends Model
{
    protected $fillable = ['label', 'pic_role', 'due', 'due_time', 'completed', 'completed_at', 'position'];

    protected function casts(): array
    {
        return [
            'due' => 'date:Y-m-d',
            'completed' => 'boolean',
            'completed_at' => 'date:Y-m-d',
            'position' => 'integer',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
