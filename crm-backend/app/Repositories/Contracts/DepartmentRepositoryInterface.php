<?php

namespace App\Repositories\Contracts;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;

interface DepartmentRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?Department;

    public function create(array $data): Department;

    public function update(int $id, array $data): bool;

    public function delete(int $id): bool;
}
