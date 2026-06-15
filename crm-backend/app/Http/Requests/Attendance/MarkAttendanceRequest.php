<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class MarkAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'nullable|date_format:Y-m-d',
            'clock_in' => 'nullable|date',
            'clock_out' => 'nullable|date|after_or_equal:clock_in',
            'status' => 'required|string|in:present,absent,half_day,late,on_leave',
            'ip_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
