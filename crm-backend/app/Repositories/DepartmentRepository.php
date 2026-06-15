<?php

namespace App\Repositories;

use App\Models\Department;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class DepartmentRepository implements DepartmentRepositoryInterface
{
    public function all(): Collection
    {
        return Department::with('headUser')->get();
    }

    public function findById(int $id): ?Department
    {
        return Department::with('headUser')->find($id);
    }

    public function create(array $data): Department
    {
        return Department::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $department = Department::find($id);
        if (!$department) {
            return false;
        }
        return $department->update($data);
    }

    public function delete(int $id): bool
    {
        $department = Department::find($id);
        if (!$department) {
            return false;
        }
        return $department->delete();
    }
}
