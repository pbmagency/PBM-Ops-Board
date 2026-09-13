<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cycle = $this->route('cycle');

        return [
            'client' => ['required', 'exists:clients,id'],
            'cycle' => ['required', 'integer', 'min:0', 'max:999', Rule::unique('cycles')->where(fn ($query) => $query->where('client_id', $this->input('client')))->ignore($cycle?->id)],
            'periode' => ['required', 'string', 'max:255'],
            'updateDate' => ['required', 'date_format:Y-m-d'],
            'status' => ['required', Rule::in(['Baseline', 'Improving', 'Declining', 'Setup'])],
            'layer' => ['nullable', 'string', 'max:255'],
            'bottleneck' => ['nullable', 'string', 'max:10000'],
            'primaryMetric' => ['required', 'string', 'max:255'],
            'hypothesis' => ['nullable', 'string', 'max:10000'],
            'optimization' => ['nullable', 'string', 'max:10000'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => ['nullable', 'string', 'max:255'],
            'variants.*.label' => ['required', 'string', 'max:255', 'distinct:ignore_case'],
            'variants.*.isControl' => ['required', 'boolean'],
            'variants.*.targetVisit' => ['nullable', 'integer', 'min:0'],
            'variants.*.realVisit' => ['nullable', 'integer', 'min:0'],
            'variants.*.bounceRate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'variants.*.leadRate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'variants.*.intentRate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $variants = collect($this->input('variants', []));
            $number = (int) $this->input('cycle');
            if ($variants->where('isControl', true)->count() !== 1) {
                $validator->errors()->add('variants', 'Cycle harus memiliki tepat satu control.');
            }
            if ($number === 0 && $variants->count() !== 1) {
                $validator->errors()->add('variants', 'Cycle 0 membutuhkan satu varian baseline.');
            }
            if ($number > 0 && $variants->count() < 2) {
                $validator->errors()->add('variants', 'Cycle uji membutuhkan control dan minimal satu varian uji.');
            }
            if ($number === 0 && $variants->contains(fn ($variant) => collect(['targetVisit', 'realVisit', 'bounceRate', 'leadRate', 'intentRate'])->contains(fn ($key) => data_get($variant, $key) === null))) {
                $validator->errors()->add('variants', 'Semua data baseline Cycle 0 wajib diisi.');
            }
        }];
    }
}
