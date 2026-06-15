<?php

namespace App\Repositories\Contracts;

use App\Models\Attendance;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AttendanceRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Attendance;
    public function findForUserOnDate(int $userId, string $date): ?Attendance;
    public function create(array $data): Attendance;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
