<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'head_user' => $this->relationLoaded('headUser') && $this->headUser ? [
                'id' => $this->headUser->id,
                'name' => $this->headUser->name,
                'email' => $this->headUser->email,
            ] : null,
            'employees_count' => $this->employees_count ?? ($this->relationLoaded('employees') ? $this->employees->count() : 0),
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
        ];
    }
}
