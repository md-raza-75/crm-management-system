<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\MarkAttendanceRequest;
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
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['user_id', 'department_id', 'date', 'start_date', 'end_date', 'status', 'search']);

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

    public function markAttendance(MarkAttendanceRequest $request, int $userId): JsonResponse
    {
        try {
            $attendance = $this->attendanceService->markAttendance($userId, $request->validated());
            
            return response()->json([
                'message' => 'Attendance marked successfully.',
                'data' => new AttendanceResource($attendance),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function update(MarkAttendanceRequest $request, int $id): JsonResponse
    {
        $updated = $this->attendanceService->updateAttendance($id, $request->validated());

        if (!$updated) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        $attendance = $this->attendanceService->findAttendanceById($id);

        return response()->json([
            'message' => 'Attendance record updated successfully.',
            'data' => new AttendanceResource($attendance),
        ]);
    }
}
