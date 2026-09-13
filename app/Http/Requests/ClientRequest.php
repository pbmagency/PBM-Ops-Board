<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('clients')->ignore($this->route('client'))],
            'contract' => ['required', 'string', 'max:255'],
            'bottleneck' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
