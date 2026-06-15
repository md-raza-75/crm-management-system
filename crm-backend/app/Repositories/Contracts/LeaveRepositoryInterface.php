<?php

namespace App\Repositories\Contracts;

use App\Models\Leave;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface LeaveRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Leave;
    public function create(array $data): Leave;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function getLeaveDaysUsed(int $userId, int $leaveTypeId, int $year): float;
}
