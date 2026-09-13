<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cycle extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'client_id', 'cycle', 'periode', 'update_date', 'status', 'layer', 'bottleneck', 'primary_metric', 'hypothesis', 'optimization'];

    protected function casts(): array
    {
        return ['cycle' => 'integer', 'update_date' => 'date:Y-m-d'];
    }

    public function variants(): HasMany
    {
        return $this->hasMany(CycleVariant::class);
    }
}
