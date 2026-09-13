<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskStatusEvent extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['task_id', 'from_status', 'to_status', 'changed_by', 'due_snapshot'];

    protected function casts(): array
    {
        return ['due_snapshot' => 'date:Y-m-d'];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
