<?php

namespace App\Repositories\Contracts;

use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EmployeeRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Employee;

    public function findByUserId(int $userId): ?Employee;

    public function create(array $data): Employee;

    public function update(int $id, array $data): bool;

    public function delete(int $id): bool;
}
