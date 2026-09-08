<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'name', 'contract', 'bottleneck'];

    public function tasks(): HasMany { return $this->hasMany(Task::class); }
    public function cycles(): HasMany { return $this->hasMany(Cycle::class); }
    public function feedback(): HasMany { return $this->hasMany(Feedback::class); }
}
