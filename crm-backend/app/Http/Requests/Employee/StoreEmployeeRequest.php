<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // User validations
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => 'sometimes|string|in:employee,hr_manager',
            
            // Employee validations
            'employee_code' => 'nullable|string|max:20|unique:employees',
            'department_id' => 'nullable|exists:departments,id',
            'designation' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'joining_date' => 'required|date',
            'salary' => 'nullable|numeric|min:0',
            'employment_type' => 'required|string|in:full_time,part_time,contract,intern',
            'status' => 'required|string|in:active,inactive,terminated,on_leave',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ];
    }
}
