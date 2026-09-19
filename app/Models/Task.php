<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'client_id', 'name', 'workflow', 'status', 'pic', 'due', 'completed_at', 'due_at_completion', 'cycle', 'priority', 'brief', 'blocked'];

    protected function casts(): array
    {
        return ['due' => 'date:Y-m-d', 'completed_at' => 'date:Y-m-d', 'due_at_completion' => 'date:Y-m-d', 'cycle' => 'integer', 'blocked' => 'boolean'];
    }

    public function statusEvents(): HasMany
    {
        return $this->hasMany(TaskStatusEvent::class);
    }

    public function assignees(): HasMany
    {
        return $this->hasMany(TaskAssignee::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(TaskChecklistItem::class)->orderBy('position');
    }
}
