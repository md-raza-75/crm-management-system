<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'leave_type_id' => $this->leave_type_id,
            'start_date' => $this->start_date ? $this->start_date->toDateString() : null,
            'end_date' => $this->end_date ? $this->end_date->toDateString() : null,
            'total_days' => $this->total_days,
            'reason' => $this->reason,
            'status' => $this->status,
            'reviewed_by' => $this->reviewed_by,
            'reviewed_at' => $this->reviewed_at ? $this->reviewed_at->toDateTimeString() : null,
            'review_remarks' => $this->review_remarks,
            'leave_type' => $this->relationLoaded('leaveType') && $this->leaveType ? [
                'id' => $this->leaveType->id,
                'name' => $this->leaveType->name,
                'is_paid' => $this->leaveType->is_paid,
            ] : null,
            'user' => $this->relationLoaded('user') && $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'employee_code' => $this->user->employee ? $this->user->employee->employee_code : null,
                'department' => $this->user->employee && $this->user->employee->department ? $this->user->employee->department->name : 'N/A',
            ] : null,
            'reviewer' => $this->relationLoaded('reviewer') && $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];
    }
}
