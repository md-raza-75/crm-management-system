<?php

namespace App\Services;

use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\User;
use App\Repositories\Contracts\LeaveRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LeaveService
{
    protected $leaveRepository;

    public function __construct(LeaveRepositoryInterface $leaveRepository)
    {
        $this->leaveRepository = $leaveRepository;
    }

    public function paginateLeaves(int $perPage = 15, array $filters = [])
    {
        return $this->leaveRepository->paginate($perPage, $filters);
    }

    public function findLeaveById(int $id)
    {
        return $this->leaveRepository->findById($id);
    }

    public function applyLeave(User $user, array $data): Leave
    {
        $startDate = Carbon::parse($data['start_date']);
        $endDate = Carbon::parse($data['end_date']);

        if ($startDate->gt($endDate)) {
            throw new \Exception('Start date cannot be after end date.');
        }

        // Calculate total days (inclusive)
        $totalDays = $startDate->diffInDays($endDate) + 1;

        // Check if leave type is active
        $leaveType = LeaveType::findOrFail($data['leave_type_id']);
        if (!$leaveType->is_active) {
            throw new \Exception('This leave type is currently inactive.');
        }

        // Check Leave Balance
        $year = $startDate->year;
        $daysUsed = $this->leaveRepository->getLeaveDaysUsed($user->id, $leaveType->id, $year);
        $remaining = $leaveType->max_days_per_year - $daysUsed;

        if ($totalDays > $remaining) {
            throw new \Exception("Insufficient leave balance. You requested {$totalDays} days, but only have {$remaining} days remaining for {$year}.");
        }

        return $this->leaveRepository->create([
            'user_id' => $user->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'total_days' => $totalDays,
            'reason' => $data['reason'],
            'status' => 'pending',
        ]);
    }

    public function reviewLeave(int $id, int $reviewerId, array $data): Leave
    {
        return DB::transaction(function () use ($id, $reviewerId, $data) {
            $leave = Leave::find($id);
            if (!$leave) {
                throw new \Exception('Leave request not found.');
            }

            if ($leave->status !== 'pending') {
                throw new \Exception('This leave request has already been reviewed.');
            }

            $status = $data['status']; // approved or rejected
            $remarks = $data['review_remarks'] ?? null;

            $this->leaveRepository->update($id, [
                'status' => $status,
                'reviewed_by' => $reviewerId,
                'reviewed_at' => Carbon::now(),
                'review_remarks' => $remarks,
            ]);

            // If approved, we can optionally pre-mark attendance records for the range of dates as 'on_leave'
            if ($status === 'approved') {
                $start = Carbon::parse($leave->start_date);
                $end = Carbon::parse($leave->end_date);
                
                for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                    // Pre-create/update attendance as 'on_leave' if it doesn't already exist or exists as present/absent
                    DB::table('attendances')->updateOrInsert(
                        [
                            'user_id' => $leave->user_id,
                            'date' => $date->toDateString(),
                        ],
                        [
                            'status' => 'on_leave',
                            'notes' => "Approved Leave: {$leave->leaveType->name}",
                            'updated_at' => now(),
                        ]
                    );
                }
            }

            return $this->findLeaveById($id);
        });
    }

    public function cancelLeave(int $id, int $userId): bool
    {
        $leave = Leave::find($id);
        if (!$leave) {
            return false;
        }

        if ($leave->user_id !== $userId) {
            throw new \Exception('Unauthorized to cancel this leave request.');
        }

        if ($leave->status !== 'pending') {
            throw new \Exception('Only pending leave requests can be cancelled.');
        }

        return $this->leaveRepository->update($id, ['status' => 'cancelled']);
    }

    public function getLeaveBalance(int $userId, int $year): array
    {
        $leaveTypes = LeaveType::where('is_active', true)->get();
        $balance = [];

        foreach ($leaveTypes as $type) {
            $used = $this->leaveRepository->getLeaveDaysUsed($userId, $type->id, $year);
            $balance[] = [
                'leave_type_id' => $type->id,
                'name' => $type->name,
                'max_days' => $type->max_days_per_year,
                'used' => $used,
                'remaining' => max(0, $type->max_days_per_year - $used),
                'is_paid' => $type->is_paid,
            ];
        }

        return $balance;
    }
}
