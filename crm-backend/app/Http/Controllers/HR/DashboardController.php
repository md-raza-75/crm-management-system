<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
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
        $sevenDaysFromNow = Carbon::today()->addDays(7)->toDateString();

        $totalEmployees = Employee::where('status', 'active')->count();
        $pendingLeaves = Leave::where('status', 'pending')->count();
        
        $presentToday = Attendance::whereDate('date', $today)
            ->whereIn('status', ['present', 'late'])
            ->count();
            
        $onLeaveToday = Attendance::whereDate('date', $today)
            ->where('status', 'on_leave')
            ->count();

        $absentToday = Attendance::whereDate('date', $today)
            ->where('status', 'absent')
            ->count();

        $activeTasks = Task::whereIn('status', ['pending', 'in_progress'])->count();

        // Leave calendar for next 7 days
        $upcomingLeaves = Leave::with(['user', 'leaveType'])
            ->where('status', 'approved')
            ->where(function ($q) use ($today, $sevenDaysFromNow) {
                $q->whereBetween('start_date', [$today, $sevenDaysFromNow])
                  ->orWhereBetween('end_date', [$today, $sevenDaysFromNow]);
            })
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'user_name' => $leave->user->name,
                    'leave_type' => $leave->leaveType->name,
                    'start_date' => $leave->start_date->toDateString(),
                    'end_date' => $leave->end_date->toDateString(),
                    'total_days' => $leave->total_days,
                ];
            });

        // Tasks due in next 7 days
        $upcomingTasks = Task::with('assignee')
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereBetween('due_date', [$today, $sevenDaysFromNow])
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'assignee_name' => $task->assignee->name,
                    'due_date' => $task->due_date->toDateString(),
                    'priority' => $task->priority,
                ];
            });

        return response()->json([
            'stats' => [
                'total_employees' => $totalEmployees,
                'pending_leaves' => $pendingLeaves,
                'present_today' => $presentToday,
                'on_leave_today' => $onLeaveToday,
                'absent_today' => $absentToday,
                'active_tasks' => $activeTasks,
            ],
            'upcoming_leaves' => $upcomingLeaves,
            'upcoming_tasks' => $upcomingTasks,
        ]);
    }
}
