<?php

namespace App\Repositories;

use App\Models\Attendance;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AttendanceRepository implements AttendanceRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Attendance::with(['user.employee.department']);

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['department_id'])) {
            $departmentId = $filters['department_id'];
            $query->whereHas('user.employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        if (!empty($filters['date'])) {
            $query->whereDate('date', $filters['date']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('date', [$filters['start_date'], $filters['end_date']]);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('date', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?Attendance
    {
        return Attendance::with('user')->find($id);
    }

    public function findForUserOnDate(int $userId, string $date): ?Attendance
    {
        return Attendance::where('user_id', $userId)
            ->whereDate('date', $date)
            ->first();
    }

    public function create(array $data): Attendance
    {
        return Attendance::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $attendance = Attendance::find($id);
        if (!$attendance) {
            return false;
        }
        return $attendance->update($data);
    }

    public function delete(int $id): bool
    {
        $attendance = Attendance::find($id);
        if (!$attendance) {
            return false;
        }
        return $attendance->delete();
    }
}
