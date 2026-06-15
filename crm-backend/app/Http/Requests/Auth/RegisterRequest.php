<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'sometimes|string|in:employee,hr_manager,super_admin',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'designation' => 'nullable|string|max:100',
            'joining_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
        ];
    }
}
