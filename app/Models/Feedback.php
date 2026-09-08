<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table = 'feedback';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'client_id', 'date', 'phase', 'from', 'from_type', 'topic', 'details', 'priority', 'action'];
    protected function casts(): array { return ['date' => 'date:Y-m-d', 'phase' => 'integer', 'priority' => 'integer']; }
}
