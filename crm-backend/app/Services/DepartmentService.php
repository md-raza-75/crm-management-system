<?php

namespace App\Services;

use App\Models\Department;
use App\Repositories\Contracts\DepartmentRepositoryInterface;

class DepartmentService
{
    protected $departmentRepository;

    public function __construct(DepartmentRepositoryInterface $departmentRepository)
    {
        $this->departmentRepository = $departmentRepository;
    }

    public function allDepartments()
    {
        return $this->departmentRepository->all();
    }

    public function findDepartmentById(int $id)
    {
        return $this->departmentRepository->findById($id);
    }

    public function createDepartment(array $data): Department
    {
        return $this->departmentRepository->create($data);
    }

    public function updateDepartment(int $id, array $data): bool
    {
        return $this->departmentRepository->update($id, $data);
    }

    public function deleteDepartment(int $id): bool
    {
        return $this->departmentRepository->delete($id);
    }
}
