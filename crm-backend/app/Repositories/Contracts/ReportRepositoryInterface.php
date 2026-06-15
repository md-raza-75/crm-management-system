<?php

namespace App\Repositories\Contracts;

use App\Models\Report;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ReportRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Report;
    public function create(array $data): Report;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
