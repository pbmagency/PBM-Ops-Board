<?php

namespace Database\Seeders;

use App\Models\TeamKpiDefinition;
use App\Models\TeamReport;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class TeamPerformanceSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->definitions() as $definition) {
            TeamKpiDefinition::query()->updateOrCreate(['id' => $definition['id']], $definition);
        }

        $users = User::query()->where('active', true)->orderBy('id')->get();
        $lastWeek = CarbonImmutable::now('Asia/Jakarta')->startOfWeek()->subWeek();

        for ($offset = 3; $offset >= 0; $offset--) {
            $week = $lastWeek->subWeeks($offset);
            foreach ($users as $userIndex => $user) {
                $report = TeamReport::query()->updateOrCreate(
                    ['id' => $user->id.':'.$week->format('Y-m-d')],
                    [
                        'user_id' => $user->id,
                        'role' => $user->role->value,
                        'week' => $week->format('Y-m-d'),
                        'status' => 'saved',
                        'summary' => 'Prioritas utama minggu ini selesai sesuai rencana.',
                        'cause' => 'Kendala utama berasal dari antrean handoff yang terlambat.',
                        'plan' => 'Rapikan handoff dan selesaikan prioritas minggu depan.',
                        'decision' => 'Tidak ada keputusan tambahan untuk data contoh ini.',
                        'demo' => true,
                    ],
                );

                $definitions = TeamKpiDefinition::query()->where('role', $user->role->value)->where('active', true)->orderBy('created_at')->get();
                foreach ($definitions as $metricIndex => $definition) {
                    $value = $this->sampleValue($definition, $userIndex, $metricIndex, $offset);
                    $report->metrics()->updateOrCreate(
                        ['metric_key' => $definition->id],
                        [
                            'definition_id' => $definition->id,
                            'name' => $definition->name,
                            'target' => $definition->target,
                            'high' => $definition->high,
                            'unit' => $definition->unit,
                            'direction' => $definition->direction,
                            'period' => $definition->period,
                            'value' => $value,
                            'position' => $metricIndex,
                        ],
                    );
                }
            }
        }
    }

    private function sampleValue(TeamKpiDefinition $definition, int $userIndex, int $metricIndex, int $offset): float
    {
        if ($definition->target === null) {
            return 4 + $userIndex + $offset;
        }
        if ($definition->direction === 'range') {
            return $definition->target + 5 + $offset;
        }
        if ($definition->direction === 'max') {
            return max(0, round($definition->target * (0.8 + $offset * 0.08), 1));
        }

        return round($definition->target * (0.87 + (3 - $offset) * 0.04) - ($metricIndex === 0 && $userIndex % 3 === 0 ? 4 : 0), 1);
    }

    private function definitions(): array
    {
        $effective = '2026-01-05';
        $kpi = fn (string $id, string $role, string $name, ?float $target, string $unit, string $direction = 'min', string $period = 'weekly', ?float $high = null) => compact('id', 'role', 'name', 'target', 'unit', 'direction', 'period', 'high') + ['effective' => $effective, 'active' => true];

        return [
            $kpi('util', 'coo', 'Capacity Utilization', 70, '%', 'range', 'weekly', 85),
            $kpi('escalation', 'coo', 'Escalation Resolution Time', 3, 'hari kerja', 'max'),
            $kpi('allocation', 'coo', 'Alokasi Delivery', 80, '%', 'range', 'monthly', 90),
            $kpi('audit', 'coo', 'QC Audit Pass Rate', 90, '%', 'min', 'monthly'),
            $kpi('sop', 'coo', 'SOP Coverage', 100, '%', 'min', 'quarterly'),

            $kpi('ontime-pm', 'project-manager', 'On-Time Delivery Rate', 90, '%', 'gt'),
            $kpi('qc-pm', 'project-manager', 'First-Time QC Pass Rate', 85, '%'),
            $kpi('turnaround', 'project-manager', 'Turnaround terhadap SLA', 100, '% SLA', 'max'),
            $kpi('blocker', 'project-manager', 'Blocker Aging', 2, 'hari kerja', 'max'),
            $kpi('churn', 'project-manager', 'Client Churn', 0, 'klien', 'max', 'monthly'),
            $kpi('retention', 'project-manager', 'Client Retention Rate', 90, '%', 'min', 'monthly'),
            $kpi('csat', 'project-manager', 'Client Satisfaction', 4.5, '/ 5', 'min', 'monthly'),

            $kpi('booked', 'cmo', 'Booked Meeting Internal', null, 'meeting', 'observe'),
            $kpi('cpbm', 'cmo', 'Cost per Booked Meeting', null, 'Rp', 'observe', 'monthly'),

            $kpi('internal', 'marketing-manager', 'On-Time Aset Internal', 90, '%'),
            $kpi('marketing-cap', 'marketing-manager', 'Alokasi Marketing', 20, '%', 'min', 'monthly'),
            $kpi('calendar', 'marketing-manager', 'Kepatuhan Kalender Marketing', 100, '%', 'min', 'monthly'),

            $kpi('daily-dm', 'digital-marketer', 'Kepatuhan Daily Report', 100, '%'),
            $kpi('experiment', 'digital-marketer', 'Siklus Eksperimen Selesai', 3, 'siklus', 'min', 'monthly'),

            $kpi('asset', 'creative', 'On-Time Asset Delivery', 100, '%'),
            $kpi('approval', 'creative', 'First-Time Approval Rate', 80, '%'),
            $kpi('daily-cr', 'creative', 'Kepatuhan Daily Report', 100, '%'),
            $kpi('revisions', 'creative', 'Revisi per Aset', 2, 'putaran', 'max', 'monthly'),

            $kpi('publish', 'developer', 'On-Time Publish Rate', 100, '%'),
            $kpi('staging', 'developer', 'QC Pass Rate Staging', 85, '%'),

            $kpi('content', 'content-specialist', 'Publishing Consistency', 100, '%', 'min', 'monthly'),
            $kpi('reach', 'content-specialist', 'Reach Growth', 0, '%', 'gt', 'monthly'),
            $kpi('engagement', 'content-specialist', 'Engagement Growth', 10, '%', 'min', 'monthly'),
            $kpi('organic', 'content-specialist', 'Lead Organik', null, 'lead', 'observe', 'monthly'),

            $kpi('showup', 'appointment-setter', 'Show-Up Rate', 70, '%'),
            $kpi('schedule', 'appointment-setter', 'Speed to Schedule', 4, 'jam kerja', 'max'),
            $kpi('noshow', 'appointment-setter', 'Tindak Lanjut No-Show', 100, '%'),
            $kpi('log', 'appointment-setter', 'Kelengkapan Log Jadwal', 100, '%'),
        ];
    }
}
