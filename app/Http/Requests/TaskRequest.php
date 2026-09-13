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
            'status' => ['required', Rule::in(['intake', 'strategy', 'design', 'frontend', 'staging', 'qa', 'review', 'done'])],
            'pic' => ['required', Rule::enum(UserRole::class)],
            'due' => ['required', 'date_format:Y-m-d'],
            'cycle' => ['required', 'integer', 'min:0', 'max:999'],
            'revision' => ['required', 'integer', 'min:0'],
            'priority' => ['required', Rule::in(['normal', 'urgent'])],
            'type' => ['required', Rule::in(['feature', 'hotfix'])],
            'brief' => ['nullable', 'string', 'max:20000'],
            'blocked' => ['required', 'boolean'],
        ];
    }
}
