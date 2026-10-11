<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentralizedAnalytic extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'project_key',
        'session_id',
        'event_type',
        'event_data',
        'referral_source',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'ip_hash',
        'user_agent',
        'user_id',
        'occurred_at',
        'synced_at',
    ];

    protected $casts = [
        'event_data' => 'array',
        'occurred_at' => 'datetime',
        'synced_at' => 'datetime',
    ];

    public static function supportedProjects(): array
    {
        return [
            'ecourse-ka-tsan' => 'Ecourse Ka Tsan',
            'lp-gorden' => 'LP Gorden',
            'lp-menjangan' => 'LP Menjangan',
            'project-pbm' => 'Project PBM',
        ];
    }
}
