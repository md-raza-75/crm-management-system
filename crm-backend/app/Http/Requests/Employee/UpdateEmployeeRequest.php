<?php

namespace App\Http\Requests\Employee;

use App\Models\Employee;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('id');
        $employee = Employee::find($employeeId);
        $userId = $employee ? $employee->user_id : null;

        return [
            // User validations
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $userId,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => 'sometimes|string|in:employee,hr_manager',
            
            // Employee validations
            'employee_code' => 'sometimes|string|max:20|unique:employees,employee_code,' . $employeeId,
            'department_id' => 'nullable|exists:departments,id',
            'designation' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'joining_date' => 'sometimes|date',
            'salary' => 'nullable|numeric|min:0',
            'employment_type' => 'sometimes|string|in:full_time,part_time,contract,intern',
            'status' => 'sometimes|string|in:active,inactive,terminated,on_leave',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ];
    }
}
