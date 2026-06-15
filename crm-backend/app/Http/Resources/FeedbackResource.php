<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $employeeData = null;

        if (!$this->is_anonymous && $this->employee) {
            $emp = $this->employee->employee;
            $employeeData = [
                'id' => $this->employee->id,
                'name' => $this->employee->name,
                'email' => $this->employee->email,
                'employee_code' => $emp ? $emp->employee_code : 'N/A',
                'designation' => $emp ? $emp->designation : 'N/A',
                'department' => ($emp && $emp->department) ? [
                    'id' => $emp->department->id,
                    'name' => $emp->department->name,
                ] : null,
            ];
        } else {
            $employeeData = [
                'id' => null,
                'name' => 'Anonymous',
                'email' => 'N/A',
                'employee_code' => 'N/A',
                'designation' => 'N/A',
                'department' => null,
            ];
        }

        return [
            'id' => $this->id,
            'is_anonymous' => (bool)$this->is_anonymous,
            'answers' => $this->answers,
            'submitted_at' => $this->submitted_at ? $this->submitted_at->toDateTimeString() : null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
            'employee' => $employeeData,
        ];
    }
}
