<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Client;
use App\Models\Cycle;
use App\Models\Feedback;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OperationsController
{
    private const STATUSES = ['intake', 'strategy', 'design', 'frontend', 'staging', 'qa', 'review', 'done'];
    private const ROLES = ['coo', 'developer', 'creative', 'digital-marketer', 'project-manager'];
    private const CYCLE_STATUSES = ['Baseline', 'Improving', 'Declining', 'Setup'];

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user(), 401);

        return response()->json(['operations' => $this->allData()]);
    }

    public function storeClient(Request $request): JsonResponse
    {
        $this->ensureManager($request);
        $data = $this->clientData($request);
        $client = Client::create(['id' => (string) Str::uuid(), ...$data]);
        return response()->json(['record' => $this->client($client)], 201);
    }

    public function updateClient(Request $request, Client $client): JsonResponse
    {
        $this->ensureManager($request);
        $client->update($this->clientData($request, $client));
        return response()->json(['record' => $this->client($client->fresh())]);
    }

    public function destroyClient(Request $request, Client $client): JsonResponse
    {
        $this->ensureManager($request);
        $client->delete();
        return response()->json(['deleted' => true]);
    }

    public function storeTask(Request $request): JsonResponse
    {
        $this->ensureManager($request);
        $task = Task::create(['id' => (string) Str::uuid(), ...$this->taskData($request)]);
        return response()->json(['record' => $this->task($task)], 201);
    }

    public function updateTask(Request $request, Task $task): JsonResponse
    {
        $this->ensureManager($request);
        $task->update($this->taskData($request));
        return response()->json(['record' => $this->task($task->fresh())]);
    }

    public function destroyTask(Request $request, Task $task): JsonResponse
    {
        $this->ensureManager($request);
        $task->delete();
        return response()->json(['deleted' => true]);
    }

    public function storeCycle(Request $request): JsonResponse
    {
        $this->ensureCycleManager($request);
        $cycle = DB::transaction(function () use ($request) {
            [$data, $variants] = $this->cycleData($request);
            $cycle = Cycle::create(['id' => (string) Str::uuid(), ...$data]);
            $this->replaceVariants($cycle, $variants);
            return $cycle;
        });
        return response()->json(['record' => $this->cycle($cycle->load('variants'))], 201);
    }

    public function updateCycle(Request $request, Cycle $cycle): JsonResponse
    {
        $this->ensureCycleManager($request);
        DB::transaction(function () use ($request, $cycle) {
            [$data, $variants] = $this->cycleData($request, $cycle);
            $cycle->update($data);
            $cycle->variants()->delete();
            $this->replaceVariants($cycle, $variants);
        });
        return response()->json(['record' => $this->cycle($cycle->fresh()->load('variants'))]);
    }

    public function destroyCycle(Request $request, Cycle $cycle): JsonResponse
    {
        $this->ensureCycleManager($request);
        $cycle->delete();
        return response()->json(['deleted' => true]);
    }

    public function storeFeedback(Request $request): JsonResponse
    {
        $this->ensureManager($request);
        $feedback = Feedback::create(['id' => (string) Str::uuid(), ...$this->feedbackData($request)]);
        return response()->json(['record' => $this->feedback($feedback)], 201);
    }

    public function updateFeedback(Request $request, Feedback $feedback): JsonResponse
    {
        $this->ensureManager($request);
        $feedback->update($this->feedbackData($request));
        return response()->json(['record' => $this->feedback($feedback->fresh())]);
    }

    public function updateFeedbackAction(Request $request, Feedback $feedback): JsonResponse
    {
        abort_unless(in_array($request->user()?->role, UserRole::cases(), true), 403);
        $data = $request->validate(['action' => ['nullable', 'string', 'max:10000']]);
        $feedback->update(['action' => $data['action'] ?? '']);
        return response()->json(['record' => $this->feedback($feedback->fresh())]);
    }

    public function destroyFeedback(Request $request, Feedback $feedback): JsonResponse
    {
        $this->ensureManager($request);
        $feedback->delete();
        return response()->json(['deleted' => true]);
    }

    private function clientData(Request $request, ?Client $client = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('clients')->ignore($client?->id)],
            'contract' => ['required', 'string', 'max:255'],
            'bottleneck' => ['nullable', 'string', 'max:10000'],
        ]);
    }

    private function taskData(Request $request): array
    {
        $data = $request->validate([
            'client' => ['required', 'exists:clients,id'], 'name' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(self::STATUSES)], 'pic' => ['required', Rule::in(self::ROLES)],
            'due' => ['required', 'date_format:Y-m-d'], 'cycle' => ['required', 'integer', 'min:0', 'max:999'],
            'revision' => ['required', 'integer', 'min:0'], 'priority' => ['required', Rule::in(['normal', 'urgent'])],
            'type' => ['required', Rule::in(['feature', 'hotfix'])], 'brief' => ['nullable', 'string', 'max:20000'],
            'blocked' => ['required', 'boolean'],
        ]);
        $data['client_id'] = $data['client']; unset($data['client']);
        return $data;
    }

    private function cycleData(Request $request, ?Cycle $cycle = null): array
    {
        $data = $request->validate([
            'client' => ['required', 'exists:clients,id'],
            'cycle' => ['required', 'integer', 'min:0', 'max:999', Rule::unique('cycles')->where(fn ($q) => $q->where('client_id', $request->input('client')))->ignore($cycle?->id)],
            'periode' => ['required', 'string', 'max:255'], 'updateDate' => ['required', 'date_format:Y-m-d'],
            'status' => ['required', Rule::in(self::CYCLE_STATUSES)], 'layer' => ['nullable', 'string', 'max:255'],
            'bottleneck' => ['nullable', 'string', 'max:10000'], 'primaryMetric' => ['required', 'string', 'max:255'],
            'hypothesis' => ['nullable', 'string', 'max:10000'], 'optimization' => ['nullable', 'string', 'max:10000'],
            'variants' => ['required', 'array', 'min:1'], 'variants.*.id' => ['nullable', 'string', 'max:255'],
            'variants.*.label' => ['required', 'string', 'max:255'], 'variants.*.isControl' => ['required', 'boolean'],
            'variants.*.targetVisit' => ['nullable', 'integer', 'min:0'], 'variants.*.realVisit' => ['nullable', 'integer', 'min:0'],
            'variants.*.bounceRate' => ['nullable', 'numeric', 'min:0', 'max:100'], 'variants.*.leadRate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'variants.*.intentRate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);
        $variants = $data['variants']; unset($data['variants']);
        if (collect($variants)->where('isControl', true)->count() !== 1) throw ValidationException::withMessages(['variants' => 'Cycle harus memiliki tepat satu control.']);
        if (($data['cycle'] === 0 && count($variants) !== 1) || ($data['cycle'] > 0 && count($variants) < 2)) throw ValidationException::withMessages(['variants' => 'Cycle 0 membutuhkan satu baseline; cycle uji membutuhkan control dan varian uji.']);
        if (collect($variants)->pluck('label')->map(fn ($v) => strtolower(trim($v)))->duplicates()->isNotEmpty()) throw ValidationException::withMessages(['variants' => 'Nama setiap varian harus berbeda.']);
        if ($data['cycle'] === 0 && collect($variants)->contains(fn ($v) => collect(['targetVisit','realVisit','bounceRate','leadRate','intentRate'])->contains(fn ($key) => $v[$key] === null))) throw ValidationException::withMessages(['variants' => 'Semua data baseline Cycle 0 wajib diisi.']);
        $data = ['client_id' => $data['client'], 'cycle' => $data['cycle'], 'periode' => $data['periode'], 'update_date' => $data['updateDate'], 'status' => $data['cycle'] === 0 ? 'Baseline' : $data['status'], 'layer' => $data['layer'] ?? '', 'bottleneck' => $data['bottleneck'] ?? '', 'primary_metric' => $data['primaryMetric'], 'hypothesis' => $data['hypothesis'] ?? '', 'optimization' => $data['optimization'] ?? ''];
        return [$data, $variants];
    }

    private function feedbackData(Request $request): array
    {
        $data = $request->validate([
            'client' => ['required', 'exists:clients,id'], 'date' => ['required', 'date_format:Y-m-d'],
            'phase' => ['required', Rule::in([30, 50, 90])], 'from' => ['required', Rule::in(['COO','Developer','Creative','Digital Marketer','Project Manager'])],
            'fromType' => ['required', Rule::in(['pm','owner','client'])], 'topic' => ['required', 'string', 'max:255'],
            'details' => ['required', 'string', 'max:20000'], 'priority' => ['required', Rule::in([1,2,3])], 'action' => ['nullable', 'string', 'max:20000'],
        ]);
        return ['client_id' => $data['client'], 'date' => $data['date'], 'phase' => $data['phase'], 'from' => $data['from'], 'from_type' => $data['fromType'], 'topic' => $data['topic'], 'details' => $data['details'], 'priority' => $data['priority'], 'action' => $data['action'] ?? ''];
    }

    private function replaceVariants(Cycle $cycle, array $variants): void
    {
        foreach ($variants as $variant) $cycle->variants()->create(['id' => (string) Str::uuid(), 'label' => trim($variant['label']), 'is_control' => $variant['isControl'], 'target_visit' => $variant['targetVisit'], 'real_visit' => $variant['realVisit'], 'bounce_rate' => $variant['bounceRate'], 'lead_rate' => $variant['leadRate'], 'intent_rate' => $variant['intentRate']]);
    }

    private function ensureManager(Request $request): void { abort_unless(in_array($request->user()?->role, [UserRole::COO, UserRole::ProjectManager], true), 403); }
    private function ensureCycleManager(Request $request): void { abort_unless(in_array($request->user()?->role, [UserRole::COO, UserRole::ProjectManager, UserRole::DigitalMarketer], true), 403); }

    public function allData(): array
    {
        return ['clients' => Client::orderBy('created_at')->get()->map(fn ($v) => $this->client($v))->values(), 'tasks' => Task::orderBy('created_at')->get()->map(fn ($v) => $this->task($v))->values(), 'cycles' => Cycle::with('variants')->orderBy('client_id')->orderBy('cycle')->get()->map(fn ($v) => $this->cycle($v))->values(), 'feedback' => Feedback::orderBy('date')->get()->map(fn ($v) => $this->feedback($v))->values()];
    }
    private function client(Client $v): array { return ['id' => $v->id, 'name' => $v->name, 'contract' => $v->contract, 'bottleneck' => $v->bottleneck ?? '']; }
    private function task(Task $v): array { return ['id' => $v->id, 'name' => $v->name, 'client' => $v->client_id, 'status' => $v->status, 'pic' => $v->pic, 'due' => $v->due->format('Y-m-d'), 'cycle' => $v->cycle, 'revision' => $v->revision, 'priority' => $v->priority, 'type' => $v->type, 'brief' => $v->brief ?? '', 'blocked' => $v->blocked]; }
    private function cycle(Cycle $v): array { $variants = $v->variants->map(fn ($x) => ['id' => $x->id, 'label' => $x->label, 'isControl' => $x->is_control, 'targetVisit' => $x->target_visit, 'realVisit' => $x->real_visit, 'bounceRate' => $x->bounce_rate, 'leadRate' => $x->lead_rate, 'intentRate' => $x->intent_rate])->values()->all(); $real = collect($variants)->sum('realVisit'); $weighted = fn ($key) => $real > 0 && collect($variants)->where('realVisit', '>', 0)->every(fn ($x) => $x[$key] !== null) ? round(collect($variants)->sum(fn ($x) => $x[$key] * $x['realVisit']) / $real, 2) : null; return ['id' => $v->id, 'client' => $v->client_id, 'cycle' => $v->cycle, 'periode' => $v->periode, 'updateDate' => $v->update_date->format('Y-m-d'), 'status' => $v->status, 'layer' => $v->layer ?? '', 'bottleneck' => $v->bottleneck ?? '', 'primaryMetric' => $v->primary_metric, 'hypothesis' => $v->hypothesis ?? '', 'optimization' => $v->optimization ?? '', 'variants' => $variants, 'targetVisit' => collect($variants)->sum('targetVisit'), 'realVisit' => $real, 'bounceRate' => $weighted('bounceRate'), 'leadRate' => $weighted('leadRate'), 'intentRate' => $weighted('intentRate')]; }
    private function feedback(Feedback $v): array { return ['id' => $v->id, 'client' => $v->client_id, 'date' => $v->date->format('Y-m-d'), 'phase' => $v->phase, 'from' => $v->from, 'fromType' => $v->from_type, 'topic' => $v->topic, 'details' => $v->details, 'priority' => $v->priority, 'action' => $v->action ?? '']; }
}
