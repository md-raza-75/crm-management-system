<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'date' => $this->date ? $this->date->toDateString() : null,
            'clock_in' => $this->clock_in ? $this->clock_in->toDateTimeString() : null,
            'clock_out' => $this->clock_out ? $this->clock_out->toDateTimeString() : null,
            'total_hours' => $this->total_hours,
            'status' => $this->status,
            'ip_address' => $this->ip_address,
            'notes' => $this->notes,
            'user' => $this->relationLoaded('user') && $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'employee_code' => $this->user->employee ? $this->user->employee->employee_code : null,
                'department' => $this->user->employee && $this->user->employee->department ? $this->user->employee->department->name : 'N/A',
            ] : null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];
    }
}
