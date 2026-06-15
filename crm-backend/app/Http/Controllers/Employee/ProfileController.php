<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\UserResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    protected $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            // If they are admin or HR, they might not have an employee profile record.
            // Let's return user details instead.
            return response()->json([
                'data' => new UserResource($user->load('roles')),
            ]);
        }

        return response()->json([
            'data' => new EmployeeResource($employee->load(['user.roles', 'department'])),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            // Admin or HR updating their own user account
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
            ]);

            $user->update($validated);
            return response()->json([
                'message' => 'Profile updated successfully.',
                'data' => new UserResource($user),
            ]);
        }

        // Validate allowed employee update fields
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ]);

        $this->employeeService->updateEmployee($employee->id, $validated);

        $employee = Employee::with(['user.roles', 'department'])->find($employee->id);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => new EmployeeResource($employee),
        ]);
    }
}
