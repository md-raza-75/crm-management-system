<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Services\DepartmentService;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    protected $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $departments = $this->departmentService->allDepartments();

        return response()->json([
            'data' => DepartmentResource::collection($departments),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = $this->departmentService->createDepartment($request->validated());
        $department->load('headUser');

        return response()->json([
            'message' => 'Department created successfully.',
            'data' => new DepartmentResource($department),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $department = $this->departmentService->findDepartmentById($id);

        if (!$department) {
            return response()->json(['message' => 'Department not found.'], 404);
        }

        return response()->json([
            'data' => new DepartmentResource($department),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDepartmentRequest $request, int $id): JsonResponse
    {
        $updated = $this->departmentService->updateDepartment($id, $request->validated());

        if (!$updated) {
            return response()->json(['message' => 'Department not found.'], 404);
        }

        $department = $this->departmentService->findDepartmentById($id);

        return response()->json([
            'message' => 'Department updated successfully.',
            'data' => new DepartmentResource($department),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->departmentService->deleteDepartment($id);

        if (!$deleted) {
            return response()->json(['message' => 'Department not found.'], 404);
        }

        return response()->json([
            'message' => 'Department deleted successfully.',
        ]);
    }
}
