<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskRequest extends FormRequest
{
    private const STANDARD_STATUSES = ['intake', 'strategy', 'design', 'frontend', 'staging', 'qa', 'review', 'done'];

    private const QUICK_STATUSES = ['intake', 'in-progress', 'validation', 'done'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client' => ['required', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:255'],
            'workflow' => ['required', Rule::in(['standard', 'quick'])],
            'status' => ['required', Rule::in(array_values(array_unique([...self::STANDARD_STATUSES, ...self::QUICK_STATUSES])))],
            'pics' => ['required', 'array', 'min:1'],
            'pics.*' => ['required', 'distinct', Rule::enum(UserRole::class)],
            'due' => ['required', 'date_format:Y-m-d'],
            'cycle' => ['required', 'integer', 'min:0', 'max:999'],
            'revision' => ['required', 'integer', 'min:0'],
            'priority' => ['required', Rule::in(['normal', 'urgent'])],
            'type' => ['required', Rule::in(['feature', 'hotfix'])],
            'brief' => ['nullable', 'string', 'max:20000'],
            'blocked' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'workflow' => $this->input('workflow', 'standard'),
            'pics' => $this->input('pics', $this->filled('pic') ? [$this->input('pic')] : []),
        ]);
    }

    public function after(): array
    {
        return [function ($validator): void {
            $statuses = $this->input('workflow') === 'quick' ? self::QUICK_STATUSES : self::STANDARD_STATUSES;
            if (! in_array($this->input('status'), $statuses, true)) {
                $validator->errors()->add('status', 'Status tidak sesuai dengan workflow task.');
            }
        }];
    }
}
