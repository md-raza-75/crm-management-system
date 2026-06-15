<?php

namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;

class GenerateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'type' => 'required|string|in:attendance,leave,employee',
            'parameters' => 'nullable|array',
            'parameters.start_date' => 'required_if:type,attendance,leave|date',
            'parameters.end_date' => 'required_if:type,attendance,leave|date|after_or_equal:parameters.start_date',
            'parameters.department_id' => 'nullable|exists:departments,id',
            'parameters.status' => 'nullable|string',
        ];
    }
}
