<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeamReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['nullable', 'string', 'max:255'],
            'userId' => ['required', 'integer', 'exists:users,id'],
            'week' => ['required', 'date_format:Y-m-d'],
            'metrics' => ['required', 'array'],
            'metrics.*.id' => ['required', 'string', 'max:100'],
            'metrics.*.value' => ['nullable', 'numeric'],
            'summary' => ['nullable', 'string', 'max:10000'],
            'cause' => ['nullable', 'string', 'max:10000'],
            'plan' => ['nullable', 'string', 'max:10000'],
            'decision' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
