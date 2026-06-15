<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    // Get all employees (HR/Admin only)
    public function index()
    {
        $employees = User::with('employee')
            ->where('role', 'employee')
            ->get();
        return response()->json($employees);
    }

    // Get single employee
    public function show($id)
    {
        $employee = User::with('employee')->findOrFail($id);
        return response()->json($employee);
    }

    // Create employee (HR/Admin only)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'department' => 'nullable|string',
            'designation' => 'nullable|string',
            'joining_date' => 'required|date',
            'salary' => 'nullable|numeric'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'employee'
        ]);

        Employee::create([
            'user_id' => $user->id,
            'employee_id' => 'EMP' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            'phone' => $request->phone,
            'address' => $request->address,
            'department' => $request->department,
            'designation' => $request->designation,
            'joining_date' => $request->joining_date,
            'salary' => $request->salary,
            'status' => 'active'
        ]);

        return response()->json($user->load('employee'), 201);
    }

    // Update employee
    public function update(Request $request, $id)
    {
        $employee = Employee::where('user_id', $id)->firstOrFail();
        $employee->update($request->only([
            'phone', 'address', 'department', 'designation', 'salary', 'status'
        ]));

        if ($request->has('name')) {
            $employee->user->update(['name' => $request->name]);
        }

        return response()->json($employee->load('user'));
    }

    // Delete employee
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Employee deleted']);
    }
}