<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectSyncStatus extends Model
{
    protected $fillable = [
        'project_key',
        'project_name',
        'last_synced_at',
        'total_events_synced',
        'last_batch_count',
        'last_status',
        'last_error_message',
    ];

    protected $casts = [
        'last_synced_at' => 'datetime',
        'total_events_synced' => 'integer',
        'last_batch_count' => 'integer',
    ];

    public static function seedDefaultProjects(): void
    {
        $projects = CentralizedAnalytic::supportedProjects();

        foreach ($projects as $key => $name) {
            static::firstOrCreate(
                ['project_key' => $key],
                [
                    'project_name' => $name,
                    'last_status' => 'idle',
                    'total_events_synced' => 0,
                    'last_batch_count' => 0,
                ]
            );
        }
    }
}
