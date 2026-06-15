<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    protected $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['search', 'department_id', 'status', 'employment_type']);

        $employees = $this->employeeService->paginateEmployees($perPage, $filters);

        return response()->json([
            'data' => EmployeeResource::collection($employees),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
        ]);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = $this->employeeService->createEmployee($request->validated());
        $employee->load(['user', 'department']);

        return response()->json([
            'message' => 'Employee created successfully.',
            'data' => new EmployeeResource($employee),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $employee = $this->employeeService->findEmployeeById($id);

        if (!$employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        return response()->json([
            'data' => new EmployeeResource($employee),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $updated = $this->employeeService->updateEmployee($id, $request->validated());

        if (!$updated) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $employee = $this->employeeService->findEmployeeById($id);

        return response()->json([
            'message' => 'Employee updated successfully.',
            'data' => new EmployeeResource($employee),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->employeeService->deleteEmployee($id);

        if (!$deleted) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        return response()->json([
            'message' => 'Employee deleted successfully (user account deactivated).',
        ]);
    }
}
