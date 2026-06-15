<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['date', 'start_date', 'end_date', 'status']);
        $filters['user_id'] = $user->id; // Enforce own records only

        $attendances = $this->attendanceService->paginateAttendances($perPage, $filters);

        return response()->json([
            'data' => AttendanceResource::collection($attendances),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'per_page' => $attendances->perPage(),
                'total' => $attendances->total(),
            ],
        ]);
    }

    public function clockIn(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $ipAddress = $request->ip();
        $validated['ip_address'] = $ipAddress;

        try {
            $attendance = $this->attendanceService->clockIn($user, $validated);

            return response()->json([
                'message' => 'Clock-in recorded successfully.',
                'data' => new AttendanceResource($attendance),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function clockOut(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        try {
            $attendance = $this->attendanceService->clockOut($user, $validated);

            return response()->json([
                'message' => 'Clock-out recorded successfully.',
                'data' => new AttendanceResource($attendance),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function today(Request $request): JsonResponse
    {
        $user = $request->user();
        $todayAttendance = $this->attendanceService->getTodayAttendance($user->id);

        return response()->json([
            'data' => $todayAttendance ? new AttendanceResource($todayAttendance) : null,
        ]);
    }
}
