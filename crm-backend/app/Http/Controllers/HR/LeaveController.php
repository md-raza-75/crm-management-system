<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\ReviewLeaveRequest;
use App\Http\Resources\LeaveResource;
use App\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    protected $leaveService;

    public function __construct(LeaveService $leaveService)
    {
        $this->leaveService = $leaveService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['user_id', 'leave_type_id', 'status', 'department_id', 'search']);

        $leaves = $this->leaveService->paginateLeaves($perPage, $filters);

        return response()->json([
            'data' => LeaveResource::collection($leaves),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'per_page' => $leaves->perPage(),
                'total' => $leaves->total(),
            ],
        ]);
    }

    public function review(ReviewLeaveRequest $request, int $id): JsonResponse
    {
        $reviewer = $request->user();

        try {
            $leave = $this->leaveService->reviewLeave($id, $reviewer->id, $request->validated());

            return response()->json([
                'message' => 'Leave request reviewed successfully.',
                'data' => new LeaveResource($leave),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
