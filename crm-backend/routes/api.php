<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\LeaveTypeController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;

use App\Http\Controllers\HR\EmployeeController as HrEmployeeController;
use App\Http\Controllers\HR\AttendanceController as HrAttendanceController;
use App\Http\Controllers\HR\LeaveController as HrLeaveController;
use App\Http\Controllers\HR\TaskController as HrTaskController;
use App\Http\Controllers\HR\DashboardController as HrDashboardController;

use App\Http\Controllers\Employee\DashboardController as EmployeeDashboardController;
use App\Http\Controllers\Employee\ProfileController as EmployeeProfileController;
use App\Http\Controllers\Employee\AttendanceController as EmployeeAttendanceController;
use App\Http\Controllers\Employee\LeaveController as EmployeeLeaveController;
use App\Http\Controllers\Employee\TaskController as EmployeeTaskController;

use App\Models\Department;
use App\Models\LeaveType;
use App\Http\Controllers\FeedbackController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth profile / password routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::put('change-password', [AuthController::class, 'changePassword']);
        Route::post('profile', [AuthController::class, 'updateProfile']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
    });

    // Shared Dropdowns / Listings (accessible by authenticated users)
    Route::get('departments', function () {
        return response()->json(['data' => Department::where('is_active', true)->get()]);
    });
    Route::get('leave-types', function () {
        return response()->json(['data' => LeaveType::where('is_active', true)->get()]);
    });

    // Super Admin Routes
    Route::middleware(['role:super_admin'])->prefix('admin')->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index']);
        
        Route::apiResource('users', UserController::class);
        Route::put('users/{id}/toggle-active', [UserController::class, 'toggleActive']);
        
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('leave-types', LeaveTypeController::class);
        
        Route::apiResource('reports', ReportController::class)->only(['index', 'store', 'show', 'destroy']);
        Route::get('reports/{id}/download', [ReportController::class, 'download']);
        Route::get('feedback', [FeedbackController::class, 'adminIndex']);
        Route::get('feedback/employees', [FeedbackController::class, 'employeeStatuses']);
        Route::post('feedback/send/{employee_id}', [FeedbackController::class, 'sendRequest']);
    });

    // HR Manager Routes (also accessible by Super Admin)
    Route::middleware(['role:hr_manager|super_admin'])->prefix('hr')->group(function () {
        Route::get('dashboard', [HrDashboardController::class, 'index']);
        
        Route::apiResource('employees', HrEmployeeController::class);
        
        Route::get('attendance', [HrAttendanceController::class, 'index']);
        Route::post('attendance/{userId}/mark', [HrAttendanceController::class, 'markAttendance']);
        Route::put('attendance/{id}', [HrAttendanceController::class, 'update']);
        
        Route::get('leaves', [HrLeaveController::class, 'index']);
        Route::put('leaves/{id}/review', [HrLeaveController::class, 'review']);
        
        Route::apiResource('tasks', HrTaskController::class);
        Route::get('feedback', [FeedbackController::class, 'hrIndex']);
        Route::get('feedback/employees', [FeedbackController::class, 'employeeStatuses']);
        Route::post('feedback/send/{employee_id}', [FeedbackController::class, 'sendRequest']);
    });

    // Employee Routes
    Route::prefix('employee')->group(function () {
        Route::get('dashboard', [EmployeeDashboardController::class, 'index']);
        
        Route::get('profile', [EmployeeProfileController::class, 'show']);
        Route::put('profile', [EmployeeProfileController::class, 'update']);
        
        Route::get('attendance', [EmployeeAttendanceController::class, 'index']);
        Route::post('attendance/clock-in', [EmployeeAttendanceController::class, 'clockIn']);
        Route::post('attendance/clock-out', [EmployeeAttendanceController::class, 'clockOut']);
        Route::get('attendance/today', [EmployeeAttendanceController::class, 'today']);
        
        Route::get('leaves', [EmployeeLeaveController::class, 'index']);
        Route::post('leaves', [EmployeeLeaveController::class, 'store']);
        Route::put('leaves/{id}/cancel', [EmployeeLeaveController::class, 'cancel']);
        Route::get('leaves/balance', [EmployeeLeaveController::class, 'balance']);
        
        Route::get('tasks', [EmployeeTaskController::class, 'index']);
        Route::get('tasks/{id}', [EmployeeTaskController::class, 'show']);
        Route::put('tasks/{id}/status', [EmployeeTaskController::class, 'updateStatus']);
        Route::post('feedback/submit', [FeedbackController::class, 'submit']);
        Route::get('feedback/status', [FeedbackController::class, 'status']);
    });

});

Route::get('test', function () {
    return response()->json(['message' => 'API is working!']);
});