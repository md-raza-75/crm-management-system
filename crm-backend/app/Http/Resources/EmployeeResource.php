<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_code' => $this->employee_code,
            'designation' => $this->designation,
            'date_of_birth' => $this->date_of_birth ? $this->date_of_birth->toDateString() : null,
            'gender' => $this->gender,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'zip_code' => $this->zip_code,
            'joining_date' => $this->joining_date ? $this->joining_date->toDateString() : null,
            'salary' => $this->salary,
            'employment_type' => $this->employment_type,
            'status' => $this->status,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'user' => $this->relationLoaded('user') && $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
                'avatar' => $this->user->avatar ? asset('storage/' . $this->user->avatar) : null,
                'is_active' => $this->user->is_active,
                'roles' => $this->user->roles->pluck('name'),
            ] : null,
            'department' => $this->relationLoaded('department') && $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ] : null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];
    }
}
