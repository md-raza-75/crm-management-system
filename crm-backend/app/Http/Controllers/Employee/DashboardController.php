<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\Attendance;
use App\Models\Task;
use App\Services\LeaveService;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $leaveService;
    protected $attendanceService;

    public function __construct(LeaveService $leaveService, AttendanceService $attendanceService)
    {
        $this->leaveService = $leaveService;
        $this->attendanceService = $attendanceService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $year = Carbon::today()->year;

        // Today's attendance
        $todayAttendance = $this->attendanceService->getTodayAttendance($user->id);

        // Leave balances
        $leaveBalance = $this->leaveService->getLeaveBalance($user->id, $year);

        // Tasks stats
        $pendingTasks = Task::where('assigned_to', $user->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        $completedTasks = Task::where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->count();

        // Recent tasks
        $recentTasks = Task::where('assigned_to', $user->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date->toDateString(),
                ];
            });

        return response()->json([
            'today_attendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'date' => $todayAttendance->date->toDateString(),
                'clock_in' => $todayAttendance->clock_in ? $todayAttendance->clock_in->toDateTimeString() : null,
                'clock_out' => $todayAttendance->clock_out ? $todayAttendance->clock_out->toDateTimeString() : null,
                'status' => $todayAttendance->status,
                'total_hours' => $todayAttendance->total_hours,
            ] : null,
            'leave_balance' => $leaveBalance,
            'tasks_count' => [
                'pending' => $pendingTasks,
                'completed' => $completedTasks,
            ],
            'recent_tasks' => $recentTasks,
        ]);
    }
}
