<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleLabels = collect(UserRole::cases())->map(fn ($role) => match ($role) {
            UserRole::COO => 'COO',
            default => str($role->value)->replace('-', ' ')->title()->toString(),
        })->all();

        return [
            'client' => ['required', 'exists:clients,id'],
            'date' => ['required', 'date_format:Y-m-d'],
            'phase' => ['required', Rule::in([30, 50, 90])],
            'from' => ['required', Rule::in($roleLabels)],
            'fromType' => ['required', Rule::in(['pm', 'owner', 'client'])],
            'topic' => ['required', 'string', 'max:255'],
            'details' => ['required', 'string', 'max:20000'],
            'priority' => ['required', Rule::in([1, 2, 3])],
            'action' => ['nullable', 'string', 'max:20000'],
        ];
    }
}
