<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeamKpiDefinitionRequest;
use App\Http\Requests\TeamReportRequest;
use App\Models\TeamKpiDefinition;
use App\Models\TeamReport;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TeamPerformanceController
{
    public function storeReport(TeamReportRequest $request): RedirectResponse
    {
        $data = $request->validated();
        Gate::authorize('save-own-team-report', (int) $data['userId']);

        $week = CarbonImmutable::createFromFormat('Y-m-d', $data['week'])->startOfDay();
        if (! $week->isMonday()) {
            throw ValidationException::withMessages(['week' => 'Periode laporan harus dimulai hari Senin.']);
        }

        DB::transaction(function () use ($request, $data, $week) {
            $actor = $request->user();
            $id = $actor->id.':'.$week->format('Y-m-d');
            $report = TeamReport::query()->with('metrics')->find($id);

            if ($report) {
                $metrics = $report->metrics;
            } else {
                $metrics = TeamKpiDefinition::query()
                    ->where('role', $actor->role->value)
                    ->where('active', true)
                    ->whereDate('effective', '<=', $week)
                    ->orderBy('created_at')
                    ->get();
            }

            $incoming = collect($data['metrics'])->keyBy('id');
            if ($metrics->isEmpty()) {
                throw ValidationException::withMessages(['metrics' => 'Belum ada KPI aktif untuk role Anda pada periode ini.']);
            }

            $report = TeamReport::query()->updateOrCreate(
                ['id' => $id],
                [
                    'user_id' => $actor->id,
                    'role' => $actor->role->value,
                    'week' => $week->format('Y-m-d'),
                    'status' => 'saved',
                    'summary' => $data['summary'] ?? '',
                    'cause' => $data['cause'] ?? '',
                    'plan' => $data['plan'] ?? '',
                    'decision' => $data['decision'] ?? '',
                    'demo' => false,
                ],
            );

            foreach ($metrics as $position => $metric) {
                $metricKey = $metric instanceof TeamKpiDefinition ? $metric->id : $metric->metric_key;
                if (! $incoming->has($metricKey)) {
                    throw ValidationException::withMessages(['metrics' => "{$metric->name} belum tersedia."]);
                }

                $value = $incoming->get($metricKey)['value'];
                $value = $value === '' || $value === null ? null : (float) $value;
                if ($value !== null && $value < 0) {
                    throw ValidationException::withMessages(['metrics' => "{$metric->name} tidak boleh negatif."]);
                }
                if ($value !== null && $metric->unit === '%' && $value > 100) {
                    throw ValidationException::withMessages(['metrics' => "{$metric->name} tidak boleh lebih dari 100%."]);
                }
                if ($value !== null && $metric->unit === '/ 5' && $value > 5) {
                    throw ValidationException::withMessages(['metrics' => "{$metric->name} tidak boleh lebih dari 5."]);
                }

                $snapshot = $metric instanceof TeamKpiDefinition ? [
                    'definition_id' => $metric->id,
                    'name' => $metric->name,
                    'target' => $metric->target,
                    'high' => $metric->high,
                    'unit' => $metric->unit,
                    'direction' => $metric->direction,
                    'period' => $metric->period,
                ] : [
                    'definition_id' => $metric->definition_id,
                    'name' => $metric->name,
                    'target' => $metric->target,
                    'high' => $metric->high,
                    'unit' => $metric->unit,
                    'direction' => $metric->direction,
                    'period' => $metric->period,
                ];

                $report->metrics()->updateOrCreate(
                    ['metric_key' => $metricKey],
                    [...$snapshot, 'value' => $value, 'position' => $position],
                );
            }
        });

        return back()->with('success', 'Laporan KPI tim berhasil disimpan.');
    }

    public function storeDefinition(TeamKpiDefinitionRequest $request): RedirectResponse
    {
        Gate::authorize('manage-team-kpi-definitions');
        $data = $this->definitionData($request->validated());
        $this->ensureUniqueName($data);
        TeamKpiDefinition::query()->create(['id' => (string) Str::uuid(), ...$data]);

        return back()->with('success', 'KPI tim berhasil ditambahkan.');
    }

    public function updateDefinition(TeamKpiDefinitionRequest $request, TeamKpiDefinition $definition): RedirectResponse
    {
        Gate::authorize('manage-team-kpi-definitions');
        $data = $this->definitionData($request->validated(), $definition);
        $this->ensureUniqueName($data, $definition);
        $definition->update($data);

        return back()->with('success', 'KPI tim berhasil diperbarui.');
    }

    public function destroyDefinition(TeamKpiDefinition $definition): RedirectResponse
    {
        Gate::authorize('manage-team-kpi-definitions');
        $definition->delete();

        return back()->with('success', 'KPI tim berhasil dihapus. Riwayat laporan lama tetap utuh.');
    }

    public function allData(?User $user): array
    {
        if (! $user) {
            return ['definitions' => [], 'reports' => []];
        }

        if (! $user->canAccessTab('team')) {
            return ['definitions' => [], 'reports' => []];
        }

        $roles = $user->readableTeamRoles();
        $reports = TeamReport::query()->with('metrics')->orderBy('week')->orderBy('user_id');
        $reports->where(function ($query) use ($user, $roles) {
            $query->where('user_id', $user->id)->orWhereIn('role', $roles);
        });

        $definitions = TeamKpiDefinition::query()->orderBy('role')->orderBy('created_at');
        if (! $user->hasAbility('team_kpi.manage')) {
            $definitions->where('role', $user->role->value);
        }

        return [
            'definitions' => $definitions->get()->map(fn ($item) => $this->definition($item))->values(),
            'reports' => $reports->get()->map(fn ($item) => $this->report($item))->values(),
        ];
    }

    public function visibleUsers(?User $user): array
    {
        if (! $user) {
            return User::query()->where('active', true)->whereIn('email', User::DEMO_EMAILS)->orderBy('id')->get()->map(fn ($item) => $this->user($item))->all();
        }

        if ($user->canAccessTab('users')) {
            return User::query()->orderBy('id')->get()->map(fn ($item) => $this->user($item))->all();
        }

        $roles = $user->readableTeamRoles();
        $query = User::query()->orderBy('id');
        $query->where(function ($query) use ($user, $roles) {
            $query->whereKey($user->id)->orWhereIn('role', $roles);
        });

        return $query->get()->map(fn ($item) => $this->user($item))->all();
    }

    private function definitionData(array $data, ?TeamKpiDefinition $definition = null): array
    {
        $target = $data['target'] ?? null;
        $direction = $target === null ? 'observe' : $data['direction'];

        return [
            'role' => $data['role'],
            'name' => trim($data['name']),
            'target' => $target,
            'high' => $direction === 'range' ? ($data['high'] ?? null) : null,
            'unit' => trim($data['unit']),
            'direction' => $direction,
            'period' => $data['period'],
            'effective' => $data['effective'] ?? $definition?->effective?->format('Y-m-d') ?? now('Asia/Jakarta')->startOfWeek()->format('Y-m-d'),
            'active' => $data['active'],
        ];
    }

    private function ensureUniqueName(array $data, ?TeamKpiDefinition $definition = null): void
    {
        $duplicate = TeamKpiDefinition::query()
            ->where('role', $data['role'])
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($data['name'])])
            ->when($definition, fn ($query) => $query->whereKeyNot($definition->id))
            ->exists();
        if ($duplicate) {
            throw ValidationException::withMessages(['name' => 'Nama KPI sudah dipakai untuk role tersebut.']);
        }
    }

    private function definition(TeamKpiDefinition $item): array
    {
        return [
            'id' => $item->id, 'role' => $item->role, 'name' => $item->name, 'target' => $item->target,
            'high' => $item->high, 'unit' => $item->unit, 'direction' => $item->direction, 'period' => $item->period,
            'effective' => $item->effective->format('Y-m-d'), 'active' => $item->active,
        ];
    }

    private function report(TeamReport $item): array
    {
        return [
            'id' => $item->id, 'userId' => $item->user_id, 'role' => $item->role, 'week' => $item->week->format('Y-m-d'),
            'status' => $item->status,
            'metrics' => $item->metrics->map(fn ($metric) => [
                'id' => $metric->metric_key, 'name' => $metric->name, 'target' => $metric->target, 'high' => $metric->high,
                'unit' => $metric->unit, 'direction' => $metric->direction, 'period' => $metric->period, 'value' => $metric->value,
            ])->values(),
            'summary' => $item->summary ?? '', 'cause' => $item->cause ?? '', 'plan' => $item->plan ?? '',
            'decision' => $item->decision ?? '', 'demo' => $item->demo, 'updatedAt' => $item->updated_at?->toISOString(),
        ];
    }

    private function user(User $item): array
    {
        return ['id' => $item->id, 'name' => $item->name, 'email' => $item->email, 'role' => $item->role->value, 'active' => $item->active];
    }
}
