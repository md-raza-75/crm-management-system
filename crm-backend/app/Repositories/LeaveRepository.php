<?php

namespace App\Repositories;

use App\Models\Leave;
use App\Repositories\Contracts\LeaveRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LeaveRepository implements LeaveRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Leave::with(['user.employee.department', 'leaveType', 'reviewer']);

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['leave_type_id'])) {
            $query->where('leave_type_id', $filters['leave_type_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['department_id'])) {
            $departmentId = $filters['department_id'];
            $query->whereHas('user.employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?Leave
    {
        return Leave::with(['user.employee', 'leaveType', 'reviewer'])->find($id);
    }

    public function create(array $data): Leave
    {
        return Leave::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $leave = Leave::find($id);
        if (!$leave) {
            return false;
        }
        return $leave->update($data);
    }

    public function delete(int $id): bool
    {
        $leave = Leave::find($id);
        if (!$leave) {
            return false;
        }
        return $leave->delete();
    }

    public function getLeaveDaysUsed(int $userId, int $leaveTypeId, int $year): float
    {
        return (float) Leave::where('user_id', $userId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->sum('total_days');
    }
}
