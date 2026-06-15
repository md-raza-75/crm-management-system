<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\StoreLeaveRequest;
use App\Http\Resources\LeaveResource;
use App\Services\LeaveService;
use Carbon\Carbon;
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
        $user = $request->user();
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['leave_type_id', 'status']);
        $filters['user_id'] = $user->id; // Enforce own records only

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

    public function store(StoreLeaveRequest $request): JsonResponse
    {
        $user = $request->user();

        try {
            $leave = $this->leaveService->applyLeave($user, $request->validated());
            $leave->load(['leaveType']);

            return response()->json([
                'message' => 'Leave request submitted successfully.',
                'data' => new LeaveResource($leave),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $success = $this->leaveService->cancelLeave($id, $user->id);

            if (!$success) {
                return response()->json(['message' => 'Leave request not found.'], 404);
            }

            return response()->json([
                'message' => 'Leave request cancelled successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        $year = Carbon::today()->year;

        $balances = $this->leaveService->getLeaveBalance($user->id, $year);

        return response()->json([
            'data' => $balances,
        ]);
    }
}
