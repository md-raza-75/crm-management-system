<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'assigned_to' => $this->assigned_to,
            'assigned_by' => $this->assigned_by,
            'priority' => $this->priority,
            'status' => $this->status,
            'due_date' => $this->due_date ? $this->due_date->toDateString() : null,
            'completed_at' => $this->completed_at ? $this->completed_at->toDateTimeString() : null,
            'assignee' => $this->relationLoaded('assignee') && $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
                'email' => $this->assignee->email,
                'employee_code' => $this->assignee->employee ? $this->assignee->employee->employee_code : null,
            ] : null,
            'assignor' => $this->relationLoaded('assignor') && $this->assignor ? [
                'id' => $this->assignor->id,
                'name' => $this->assignor->name,
            ] : null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];
    }
}
