<?php

namespace App\Services;

use App\Models\Report;
use App\Models\User;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\Attendance;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    protected $reportRepository;

    public function __construct(ReportRepositoryInterface $reportRepository)
    {
        $this->reportRepository = $reportRepository;
    }

    public function paginateReports(int $perPage = 15, array $filters = [])
    {
        return $this->reportRepository->paginate($perPage, $filters);
    }

    public function findReportById(int $id)
    {
        return $this->reportRepository->findById($id);
    }

    public function generateReport(array $data, int $userId): Report
    {
        $type = $data['type']; // 'attendance', 'leave', 'employee'
        $title = $data['title'] ?? ucfirst($type) . ' Report - ' . Carbon::now()->format('Y-m-d H:i');
        $parameters = $data['parameters'] ?? [];

        // Create Report record
        $report = $this->reportRepository->create([
            'title' => $title,
            'type' => $type,
            'generated_by' => $userId,
            'parameters' => $parameters,
            'status' => 'pending',
        ]);

        try {
            // Generate report file content
            $csvContent = '';
            
            if ($type === 'employee') {
                $csvContent = $this->generateEmployeeCsv($parameters);
            } elseif ($type === 'attendance') {
                $csvContent = $this->generateAttendanceCsv($parameters);
            } elseif ($type === 'leave') {
                $csvContent = $this->generateLeaveCsv($parameters);
            } else {
                throw new \Exception('Invalid report type.');
            }

            // Write to local disk
            $filename = 'reports/' . $type . '_report_' . $report->id . '_' . uniqid() . '.csv';
            Storage::put($filename, $csvContent);

            // Update status and file path
            $this->reportRepository->update($report->id, [
                'status' => 'completed',
                'file_path' => $filename,
            ]);

        } catch (\Exception $e) {
            $this->reportRepository->update($report->id, [
                'status' => 'failed',
            ]);
            throw $e;
        }

        return $this->findReportById($report->id);
    }

    protected function generateEmployeeCsv(array $params): string
    {
        $query = Employee::with(['user', 'department']);
        
        if (!empty($params['department_id'])) {
            $query->where('department_id', $params['department_id']);
        }
        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        $employees = $query->get();
        $handle = fopen('php://temp', 'r+');
        
        fputcsv($handle, ['Employee Code', 'Name', 'Email', 'Department', 'Designation', 'Joining Date', 'Salary', 'Employment Type', 'Status']);

        foreach ($employees as $emp) {
            fputcsv($handle, [
                $emp->employee_code,
                $emp->user ? $emp->user->name : '',
                $emp->user ? $emp->user->email : '',
                $emp->department ? $emp->department->name : 'N/A',
                $emp->designation,
                $emp->joining_date->toDateString(),
                $emp->salary,
                $emp->employment_type,
                $emp->status,
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);
        return $csv;
    }

    protected function generateAttendanceCsv(array $params): string
    {
        $query = Attendance::with(['user.employee.department']);

        if (!empty($params['start_date']) && !empty($params['end_date'])) {
            $query->whereBetween('date', [$params['start_date'], $params['end_date']]);
        }
        if (!empty($params['department_id'])) {
            $query->whereHas('user.employee', function ($q) use ($params) {
                $q->where('department_id', $params['department_id']);
            });
        }
        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        $attendances = $query->orderBy('date', 'desc')->get();
        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, ['Date', 'Employee Code', 'Employee Name', 'Department', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Notes']);

        foreach ($attendances as $att) {
            fputcsv($handle, [
                $att->date->toDateString(),
                $att->user && $att->user->employee ? $att->user->employee->employee_code : '',
                $att->user ? $att->user->name : '',
                $att->user && $att->user->employee && $att->user->employee->department ? $att->user->employee->department->name : 'N/A',
                $att->clock_in ? $att->clock_in->toDateTimeString() : 'N/A',
                $att->clock_out ? $att->clock_out->toDateTimeString() : 'N/A',
                $att->total_hours,
                $att->status,
                $att->notes,
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);
        return $csv;
    }

    protected function generateLeaveCsv(array $params): string
    {
        $query = Leave::with(['user.employee.department', 'leaveType', 'reviewer']);

        if (!empty($params['start_date']) && !empty($params['end_date'])) {
            $query->where(function ($q) use ($params) {
                $q->whereBetween('start_date', [$params['start_date'], $params['end_date']])
                  ->orWhereBetween('end_date', [$params['start_date'], $params['end_date']]);
            });
        }
        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();
        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, ['Employee Code', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Reason', 'Status', 'Reviewed By', 'Remarks']);

        foreach ($leaves as $leave) {
            fputcsv($handle, [
                $leave->user && $leave->user->employee ? $leave->user->employee->employee_code : '',
                $leave->user ? $leave->user->name : '',
                $leave->user && $leave->user->employee && $leave->user->employee->department ? $leave->user->employee->department->name : 'N/A',
                $leave->leaveType ? $leave->leaveType->name : '',
                $leave->start_date->toDateString(),
                $leave->end_date->toDateString(),
                $leave->total_days,
                $leave->reason,
                $leave->status,
                $leave->reviewer ? $leave->reviewer->name : 'N/A',
                $leave->review_remarks,
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);
        return $csv;
    }

    public function deleteReport(int $id): bool
    {
        $report = Report::find($id);
        if (!$report) {
            return false;
        }

        if ($report->file_path && Storage::exists($report->file_path)) {
            Storage::delete($report->file_path);
        }

        return $this->reportRepository->delete($id);
    }
}
