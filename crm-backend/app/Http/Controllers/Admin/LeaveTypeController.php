<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $types = LeaveType::all();
        return response()->json([
            'data' => $types,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:leave_types,name',
            'max_days_per_year' => 'required|integer|min:0',
            'is_paid' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $type = LeaveType::create($validated);

        return response()->json([
            'message' => 'Leave type created successfully.',
            'data' => $type,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $type = LeaveType::find($id);

        if (!$type) {
            return response()->json(['message' => 'Leave type not found.'], 404);
        }

        return response()->json([
            'data' => $type,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $type = LeaveType::find($id);

        if (!$type) {
            return response()->json(['message' => 'Leave type not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:leave_types,name,' . $id,
            'max_days_per_year' => 'sometimes|required|integer|min:0',
            'is_paid' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $type->update($validated);

        return response()->json([
            'message' => 'Leave type updated successfully.',
            'data' => $type,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $type = LeaveType::find($id);

        if (!$type) {
            return response()->json(['message' => 'Leave type not found.'], 404);
        }

        // Optional: Check if there are leave requests referencing this type
        if ($type->leaves()->exists()) {
            return response()->json([
                'message' => 'Cannot delete leave type because it is referenced by leave requests. You can deactivate it instead.'
            ], 422);
        }

        $type->delete();

        return response()->json([
            'message' => 'Leave type deleted successfully.',
        ]);
    }
}
