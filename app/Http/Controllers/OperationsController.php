<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Http\Requests\CycleRequest;
use App\Http\Requests\FeedbackRequest;
use App\Http\Requests\TaskRequest;
use App\Models\Client;
use App\Models\Cycle;
use App\Models\Feedback;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OperationsController
{
    public function storeClient(ClientRequest $request): RedirectResponse
    {
        Gate::authorize('manage-clients');
        Client::create(['id' => (string) Str::uuid(), ...$request->validated()]);

        return back()->with('success', 'Client berhasil ditambahkan.');
    }

    public function updateClient(ClientRequest $request, Client $client): RedirectResponse
    {
        Gate::authorize('manage-clients');
        $client->update($request->validated());

        return back()->with('success', 'Client berhasil diperbarui.');
    }

    public function destroyClient(Client $client): RedirectResponse
    {
        Gate::authorize('manage-clients');
        $client->delete();

        return back()->with('success', 'Client dan data terkait berhasil dihapus.');
    }

    public function storeTask(TaskRequest $request): RedirectResponse
    {
        Gate::authorize('manage-tasks');
        DB::transaction(function () use ($request) {
            $task = Task::create(['id' => (string) Str::uuid(), ...$this->taskData($request->validated())]);
            $this->recordStatus($task, null, $task->status, $request->user());
        });

        return back()->with('success', 'Task berhasil ditambahkan.');
    }

    public function updateTask(TaskRequest $request, Task $task): RedirectResponse
    {
        Gate::authorize('manage-tasks');
        DB::transaction(function () use ($request, $task) {
            $before = $task->status;
            $task->update($this->taskData($request->validated(), $task));
            if ($before !== $task->status) {
                $this->recordStatus($task, $before, $task->status, $request->user());
            }
        });

        return back()->with('success', 'Task berhasil diperbarui.');
    }

    public function updateTaskStatus(Request $request, Task $task): RedirectResponse
    {
        Gate::authorize('manage-tasks');
        $data = $request->validate(['status' => ['required', Rule::in(['intake', 'strategy', 'design', 'frontend', 'staging', 'qa', 'review', 'done'])]]);
        DB::transaction(function () use ($request, $task, $data) {
            $before = $task->status;
            if ($before === $data['status']) {
                return;
            }
            $task->update($this->completionData($task, $data['status']));
            $this->recordStatus($task, $before, $data['status'], $request->user());
        });

        return back()->with('success', 'Status task berhasil dipindahkan.');
    }

    public function destroyTask(Task $task): RedirectResponse
    {
        Gate::authorize('manage-tasks');
        $task->delete();

        return back()->with('success', 'Task berhasil dihapus.');
    }

    public function storeCycle(CycleRequest $request): RedirectResponse
    {
        Gate::authorize('manage-cycles');
        DB::transaction(function () use ($request) {
            [$data, $variants] = $this->cycleData($request->validated());
            $cycle = Cycle::create(['id' => (string) Str::uuid(), ...$data]);
            $this->replaceVariants($cycle, $variants);
        });

        return back()->with('success', 'Cycle KPI berhasil ditambahkan.');
    }

    public function updateCycle(CycleRequest $request, Cycle $cycle): RedirectResponse
    {
        Gate::authorize('manage-cycles');
        DB::transaction(function () use ($request, $cycle) {
            [$data, $variants] = $this->cycleData($request->validated());
            $cycle->update($data);
            $cycle->variants()->delete();
            $this->replaceVariants($cycle, $variants);
        });

        return back()->with('success', 'Cycle KPI berhasil diperbarui.');
    }

    public function destroyCycle(Cycle $cycle): RedirectResponse
    {
        Gate::authorize('manage-cycles');
        $cycle->delete();

        return back()->with('success', 'Cycle KPI berhasil dihapus.');
    }

    public function storeFeedback(FeedbackRequest $request): RedirectResponse
    {
        Gate::authorize('manage-feedback');
        Feedback::create(['id' => (string) Str::uuid(), ...$this->feedbackData($request->validated())]);

        return back()->with('success', 'Feedback berhasil ditambahkan.');
    }

    public function updateFeedback(FeedbackRequest $request, Feedback $feedback): RedirectResponse
    {
        Gate::authorize('manage-feedback');
        $feedback->update($this->feedbackData($request->validated()));

        return back()->with('success', 'Feedback berhasil diperbarui.');
    }

    public function updateFeedbackAction(Request $request, Feedback $feedback): RedirectResponse
    {
        Gate::authorize('update-feedback-action');
        $data = $request->validate(['action' => ['nullable', 'string', 'max:20000']]);
        $feedback->update(['action' => $data['action'] ?? '']);

        return back()->with('success', 'Tindak lanjut feedback berhasil diperbarui.');
    }

    public function destroyFeedback(Feedback $feedback): RedirectResponse
    {
        Gate::authorize('manage-feedback');
        $feedback->delete();

        return back()->with('success', 'Feedback berhasil dihapus.');
    }

    public function allData(?User $user): array
    {
        if (! $user) {
            return ['clients' => [], 'tasks' => [], 'cycles' => [], 'feedback' => []];
        }
        $readsClients = collect(['board', 'hub', 'kpi', 'feedback', 'clients'])->contains(fn (string $tab) => $user->canAccessTab($tab));
        $readsTasks = $user->canAccessTab('board') || $user->canAccessTab('hub');
        $readsCycles = $user->canAccessTab('kpi') || $user->canAccessTab('hub');
        $readsFeedback = $user->canAccessTab('feedback');

        return [
            'clients' => $readsClients ? Client::query()->orderBy('created_at')->get()->map(fn ($value) => $this->client($value))->values() : [],
            'tasks' => $readsTasks ? Task::query()->orderBy('created_at')->get()->map(fn ($value) => $this->task($value))->values() : [],
            'cycles' => $readsCycles ? Cycle::query()->with('variants')->orderBy('client_id')->orderBy('cycle')->get()->map(fn ($value) => $this->cycle($value))->values() : [],
            'feedback' => $readsFeedback ? Feedback::query()->orderByDesc('date')->orderByDesc('created_at')->get()->map(fn ($value) => $this->feedback($value))->values() : [],
        ];
    }

    private function taskData(array $data, ?Task $task = null): array
    {
        return [
            'client_id' => $data['client'], 'name' => $data['name'], 'pic' => $data['pic'], 'due' => $data['due'],
            'cycle' => $data['cycle'], 'revision' => $data['revision'], 'priority' => $data['priority'], 'type' => $data['type'],
            'brief' => $data['brief'] ?? '', 'blocked' => $data['blocked'],
            ...$this->completionData($task, $data['status'], $data['due']),
        ];
    }

    private function completionData(?Task $task, string $status, ?string $due = null): array
    {
        if ($status !== 'done') {
            return ['status' => $status, 'completed_at' => null, 'due_at_completion' => null];
        }
        if ($task?->status === 'done' && $task->completed_at) {
            return ['status' => $status, 'completed_at' => $task->completed_at, 'due_at_completion' => $task->due_at_completion];
        }

        return ['status' => $status, 'completed_at' => today()->toDateString(), 'due_at_completion' => $due ?? $task?->due?->format('Y-m-d')];
    }

    private function recordStatus(Task $task, ?string $from, string $to, User $actor): void
    {
        $task->statusEvents()->create(['from_status' => $from, 'to_status' => $to, 'changed_by' => $actor->id, 'due_snapshot' => $task->due]);
    }

    private function cycleData(array $data): array
    {
        $variants = $data['variants'];

        return [[
            'client_id' => $data['client'], 'cycle' => $data['cycle'], 'periode' => $data['periode'],
            'update_date' => $data['updateDate'], 'status' => $data['cycle'] === 0 ? 'Baseline' : $data['status'],
            'layer' => $data['layer'] ?? '', 'bottleneck' => $data['bottleneck'] ?? '', 'primary_metric' => $data['primaryMetric'],
            'hypothesis' => $data['hypothesis'] ?? '', 'optimization' => $data['optimization'] ?? '',
        ], $variants];
    }

    private function feedbackData(array $data): array
    {
        return ['client_id' => $data['client'], 'date' => $data['date'], 'phase' => $data['phase'], 'from' => $data['from'],
            'from_type' => $data['fromType'], 'topic' => $data['topic'], 'details' => $data['details'], 'priority' => $data['priority'], 'action' => $data['action'] ?? ''];
    }

    private function replaceVariants(Cycle $cycle, array $variants): void
    {
        foreach ($variants as $variant) {
            $cycle->variants()->create([
                'id' => (string) Str::uuid(), 'label' => trim($variant['label']), 'is_control' => $variant['isControl'],
                'target_visit' => $variant['targetVisit'], 'real_visit' => $variant['realVisit'], 'bounce_rate' => $variant['bounceRate'],
                'lead_rate' => $variant['leadRate'], 'intent_rate' => $variant['intentRate'],
            ]);
        }
    }

    private function client(Client $value): array
    {
        return ['id' => $value->id, 'name' => $value->name, 'contract' => $value->contract, 'bottleneck' => $value->bottleneck ?? ''];
    }

    private function task(Task $value): array
    {
        return ['id' => $value->id, 'name' => $value->name, 'client' => $value->client_id, 'status' => $value->status,
            'pic' => $value->pic, 'due' => $value->due->format('Y-m-d'), 'createdAt' => $value->created_at?->toDateString(),
            'completedAt' => $value->completed_at?->format('Y-m-d'), 'dueAtCompletion' => $value->due_at_completion?->format('Y-m-d'),
            'cycle' => $value->cycle, 'revision' => $value->revision, 'priority' => $value->priority, 'type' => $value->type,
            'brief' => $value->brief ?? '', 'blocked' => $value->blocked];
    }

    private function cycle(Cycle $value): array
    {
        $variants = $value->variants->map(fn ($variant) => ['id' => $variant->id, 'label' => $variant->label,
            'isControl' => $variant->is_control, 'targetVisit' => $variant->target_visit, 'realVisit' => $variant->real_visit,
            'bounceRate' => $variant->bounce_rate, 'leadRate' => $variant->lead_rate, 'intentRate' => $variant->intent_rate])->values()->all();
        $real = collect($variants)->sum('realVisit');
        $weighted = fn ($key) => $real > 0 && collect($variants)->where('realVisit', '>', 0)->every(fn ($variant) => $variant[$key] !== null)
            ? round(collect($variants)->sum(fn ($variant) => $variant[$key] * $variant['realVisit']) / $real, 2) : null;

        return ['id' => $value->id, 'client' => $value->client_id, 'cycle' => $value->cycle, 'periode' => $value->periode,
            'updateDate' => $value->update_date->format('Y-m-d'), 'status' => $value->status, 'layer' => $value->layer ?? '',
            'bottleneck' => $value->bottleneck ?? '', 'primaryMetric' => $value->primary_metric, 'hypothesis' => $value->hypothesis ?? '',
            'optimization' => $value->optimization ?? '', 'variants' => $variants, 'targetVisit' => collect($variants)->sum('targetVisit'),
            'realVisit' => $real, 'bounceRate' => $weighted('bounceRate'), 'leadRate' => $weighted('leadRate'), 'intentRate' => $weighted('intentRate')];
    }

    private function feedback(Feedback $value): array
    {
        return ['id' => $value->id, 'client' => $value->client_id, 'date' => $value->date->format('Y-m-d'),
            'phase' => $value->phase, 'from' => $value->from, 'fromType' => $value->from_type, 'topic' => $value->topic,
            'details' => $value->details, 'priority' => $value->priority, 'action' => $value->action ?? ''];
    }
}
