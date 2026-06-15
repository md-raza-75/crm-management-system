<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Leave;
use App\Models\Attendance;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        $totalEmployees = Employee::count();
        $totalHRs = User::role('hr_manager')->count();
        $totalDepartments = Department::count();
        
        $presentToday = Attendance::whereDate('date', $today)
            ->whereIn('status', ['present', 'late'])
            ->count();

        $pendingLeaves = Leave::where('status', 'pending')->count();
        
        $overdueTasks = Task::where('status', '!=', 'completed')
            ->whereDate('due_date', '<', $today)
            ->count();

        // Attendance rate of today
        $attendanceRate = $totalEmployees > 0 ? round(($presentToday / $totalEmployees) * 100, 1) : 0;

        // Recent leave requests
        $recentLeaves = Leave::with(['user', 'leaveType'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'user_name' => $leave->user->name,
                    'leave_type' => $leave->leaveType->name,
                    'start_date' => $leave->start_date->toDateString(),
                    'end_date' => $leave->end_date->toDateString(),
                    'total_days' => $leave->total_days,
                    'status' => $leave->status,
                ];
            });

        // Recent tasks
        $recentTasks = Task::with('assignee')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'assignee_name' => $task->assignee->name,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date->toDateString(),
                ];
            });

        return response()->json([
            'stats' => [
                'total_employees' => $totalEmployees,
                'total_hrs' => $totalHRs,
                'total_departments' => $totalDepartments,
                'present_today' => $presentToday,
                'pending_leaves' => $pendingLeaves,
                'overdue_tasks' => $overdueTasks,
                'attendance_rate' => $attendanceRate,
            ],
            'recent_leaves' => $recentLeaves,
            'recent_tasks' => $recentTasks,
        ]);
    }
}
