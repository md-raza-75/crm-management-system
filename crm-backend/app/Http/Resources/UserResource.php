<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'phone' => $this->phone,
            'is_active' => $this->is_active,
            'roles' => $this->roles->pluck('name'),
            'permissions' => $this->getAllPermissions()->pluck('name'),
            'employee' => $this->whenLoaded('employee', function () {
                if (!$this->employee) return null;
                return [
                    'id' => $this->employee->id,
                    'employee_code' => $this->employee->employee_code,
                    'designation' => $this->employee->designation,
                    'joining_date' => $this->employee->joining_date ? $this->employee->joining_date->toDateString() : null,
                    'salary' => $this->employee->salary,
                    'employment_type' => $this->employee->employment_type,
                    'status' => $this->employee->status,
                    'department' => $this->employee->department ? [
                        'id' => $this->employee->department->id,
                        'name' => $this->employee->department->name,
                    ] : null,
                ];
            }),
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];
    }
}
