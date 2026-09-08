<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'client_id', 'name', 'status', 'pic', 'due', 'cycle', 'revision', 'priority', 'type', 'brief', 'blocked'];
    protected function casts(): array { return ['due' => 'date:Y-m-d', 'cycle' => 'integer', 'revision' => 'integer', 'blocked' => 'boolean']; }
}
