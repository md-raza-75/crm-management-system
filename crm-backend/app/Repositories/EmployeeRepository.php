<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EmployeeRepository implements EmployeeRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Employee::with(['user.roles', 'department']);

        // Apply Search Filter (Name, Email, Employee Code, Designation)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('employee_code', 'like', "%{$search}%")
                  ->orWhere('designation', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Apply Department Filter
        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        // Apply Status Filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Apply Employment Type Filter
        if (!empty($filters['employment_type'])) {
            $query->where('employment_type', $filters['employment_type']);
        }

        // Order by latest
        return $query->latest()->paginate($perPage);
    }

    public function findById(int $id): ?Employee
    {
        return Employee::with(['user.roles', 'department'])->find($id);
    }

    public function findByUserId(int $userId): ?Employee
    {
        return Employee::with(['user.roles', 'department'])->where('user_id', $userId)->first();
    }

    public function create(array $data): Employee
    {
        return Employee::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return false;
        }
        return $employee->update($data);
    }

    public function delete(int $id): bool
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return false;
        }
        return $employee->delete();
    }
}
