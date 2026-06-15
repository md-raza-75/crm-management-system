<?php

namespace App\Repositories;

use App\Models\Report;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReportRepository implements ReportRepositoryInterface
{
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Report::with('generatedBy');

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['generated_by'])) {
            $query->where('generated_by', $filters['generated_by']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?Report
    {
        return Report::with('generatedBy')->find($id);
    }

    public function create(array $data): Report
    {
        return Report::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $report = Report::find($id);
        if (!$report) {
            return false;
        }
        return $report->update($data);
    }

    public function delete(int $id): bool
    {
        $report = Report::find($id);
        if (!$report) {
            return false;
        }
        return $report->delete();
    }
}
