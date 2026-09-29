<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client' => ['required', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:255'],
            'workflow' => ['required', Rule::in(['build', 'optimization', 'quick'])],
            'status' => ['required', Rule::in(['intake', 'in-progress', 'review', 'done'])],
            'pics' => ['required', 'array', 'min:1'],
            'pics.*' => ['required', 'distinct', Rule::enum(UserRole::class)],
            'due' => ['required', 'date_format:Y-m-d'],
            'cycle' => ['required', 'integer', 'min:0', 'max:999'],
            'priority' => ['required', Rule::in(['normal', 'urgent'])],
            'brief' => ['nullable', 'string', 'max:20000'],
            'blocked' => ['required', 'boolean'],
            'checklist' => ['sometimes', 'array', 'max:50'],
            'checklist.*.id' => ['nullable', 'integer'],
            'checklist.*.label' => ['required', 'string', 'max:255'],
            'checklist.*.picRole' => ['required', Rule::enum(UserRole::class)],
            'checklist.*.due' => ['required', 'date_format:Y-m-d'],
            'checklist.*.dueTime' => ['nullable', 'string', 'regex:/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'checklist.*.completed' => ['required', 'boolean'],
            'checklist.*.position' => ['sometimes', 'integer', 'min:0', 'distinct'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'workflow' => $this->input('workflow', 'build'),
            'pics' => $this->input('pics', $this->filled('pic') ? [$this->input('pic')] : []),
        ]);
    }
}
