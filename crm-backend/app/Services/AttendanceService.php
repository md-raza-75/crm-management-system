<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Carbon\Carbon;

class AttendanceService
{
    protected $attendanceRepository;

    public function __construct(AttendanceRepositoryInterface $attendanceRepository)
    {
        $this->attendanceRepository = $attendanceRepository;
    }

    public function paginateAttendances(int $perPage = 15, array $filters = [])
    {
        return $this->attendanceRepository->paginate($perPage, $filters);
    }

    public function findAttendanceById(int $id)
    {
        return $this->attendanceRepository->findById($id);
    }

    public function getTodayAttendance(int $userId): ?Attendance
    {
        return $this->attendanceRepository->findForUserOnDate($userId, Carbon::today()->toDateString());
    }

    public function clockIn(User $user, array $data): Attendance
    {
        $today = Carbon::today()->toDateString();
        $existing = $this->attendanceRepository->findForUserOnDate($user->id, $today);
        if ($existing) {
            throw new \Exception('Already clocked in today.');
        }

        $now = Carbon::now();
        // Standard start time: 09:00 AM
        $startTime = Carbon::createFromFormat('H:i', '09:15');
        $status = 'present';
        if ($now->format('H:i') > $startTime->format('H:i')) {
            $status = 'late';
        }

        return $this->attendanceRepository->create([
            'user_id' => $user->id,
            'date' => $today,
            'clock_in' => $now,
            'status' => $status,
            'ip_address' => $data['ip_address'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    public function clockOut(User $user, array $data): Attendance
    {
        $today = Carbon::today()->toDateString();
        $attendance = $this->attendanceRepository->findForUserOnDate($user->id, $today);
        if (!$attendance) {
            throw new \Exception('No clock-in record found for today.');
        }

        if ($attendance->clock_out) {
            throw new \Exception('Already clocked out today.');
        }

        $now = Carbon::now();
        $clockIn = Carbon::parse($attendance->clock_in);
        $totalHours = round($clockIn->diffInMinutes($now) / 60, 2);

        $attendance->update([
            'clock_out' => $now,
            'total_hours' => $totalHours,
            'notes' => $data['notes'] ?? $attendance->notes,
        ]);

        return $attendance;
    }

    public function markAttendance(int $userId, array $data): Attendance
    {
        $date = $data['date'] ?? Carbon::today()->toDateString();
        $existing = $this->attendanceRepository->findForUserOnDate($userId, $date);

        $clockIn = isset($data['clock_in']) ? Carbon::parse($data['clock_in']) : null;
        $clockOut = isset($data['clock_out']) ? Carbon::parse($data['clock_out']) : null;
        $totalHours = null;

        if ($clockIn && $clockOut) {
            $totalHours = round($clockIn->diffInMinutes($clockOut) / 60, 2);
        }

        $saveData = [
            'user_id' => $userId,
            'date' => $date,
            'clock_in' => $clockIn,
            'clock_out' => $clockOut,
            'total_hours' => $totalHours,
            'status' => $data['status'] ?? 'present',
            'ip_address' => $data['ip_address'] ?? null,
            'notes' => $data['notes'] ?? null,
        ];

        if ($existing) {
            $this->attendanceRepository->update($existing->id, $saveData);
            return $this->findAttendanceById($existing->id);
        }

        return $this->attendanceRepository->create($saveData);
    }

    public function updateAttendance(int $id, array $data): bool
    {
        $clockIn = isset($data['clock_in']) ? Carbon::parse($data['clock_in']) : null;
        $clockOut = isset($data['clock_out']) ? Carbon::parse($data['clock_out']) : null;

        if ($clockIn && $clockOut) {
            $data['total_hours'] = round($clockIn->diffInMinutes($clockOut) / 60, 2);
        }

        return $this->attendanceRepository->update($id, $data);
    }
}
