<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class TeamKpiDefinitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['nullable', 'string', 'max:100'],
            'role' => ['required', Rule::enum(UserRole::class)],
            'name' => ['required', 'string', 'max:255'],
            'target' => ['nullable', 'numeric', 'min:0'],
            'high' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'direction' => ['required', Rule::in(['min', 'max', 'gt', 'range', 'observe'])],
            'period' => ['required', Rule::in(['weekly', 'monthly', 'quarterly'])],
            'effective' => ['nullable', 'date_format:Y-m-d'],
            'active' => ['required', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            if ($this->input('direction') === 'range' && (float) $this->input('high') < (float) $this->input('target')) {
                $validator->errors()->add('high', 'Batas atas harus sama dengan atau lebih besar dari target.');
            }
        }];
    }
}
