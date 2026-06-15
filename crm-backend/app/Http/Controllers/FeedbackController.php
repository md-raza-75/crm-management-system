<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedbackResource;
use App\Models\FeedbackSurvey;
use App\Models\FeedbackRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class FeedbackController extends Controller
{
    /**
     * Submit an employee feedback survey.
     * POST api/employee/feedback/submit
     */
    public function submit(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Rule 1: One submission per employee
        $alreadySubmitted = FeedbackSurvey::where('employee_id', $userId)->exists();
        if ($alreadySubmitted) {
            return response()->json([
                'message' => 'You have already submitted feedback',
            ], 400);
        }

        $request->validate([
            'is_anonymous' => 'nullable|boolean',
            'answers' => 'required|array',
        ]);

        $feedback = FeedbackSurvey::create([
            'employee_id' => $userId,
            'is_anonymous' => $request->boolean('is_anonymous'),
            'answers' => $request->input('answers'),
            'submitted_at' => Carbon::now(),
        ]);

        // Rule 3: Mark pending feedback request as submitted
        FeedbackRequest::where('employee_id', $userId)
            ->where('status', 'pending')
            ->update([
                'status' => 'submitted',
            ]);

        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'data' => new FeedbackResource($feedback->load('employee.employee.department')),
        ], 201);
    }

    /**
     * Get the feedback submission & request status for the current logged-in employee.
     * GET api/employee/feedback/status
     */
    public function status(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $hasSubmitted = FeedbackSurvey::where('employee_id', $userId)->exists();
        $hasPendingRequest = FeedbackRequest::where('employee_id', $userId)->where('status', 'pending')->exists();

        return response()->json([
            'has_submitted' => $hasSubmitted,
            'has_pending_request' => $hasPendingRequest,
        ]);
    }

    /**
     * Send feedback survey request to employee (Admin/HR).
     * POST api/admin/feedback/send/{employee_id}
     * POST api/hr/feedback/send/{employee_id}
     */
    public function sendRequest(Request $request, $employeeId): JsonResponse
    {
        $employee = User::find($employeeId);
        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found.',
            ], 404);
        }

        // Check if employee already submitted feedback
        $alreadySubmitted = FeedbackSurvey::where('employee_id', $employeeId)->exists();
        if ($alreadySubmitted) {
            return response()->json([
                'message' => 'Employee has already submitted feedback.',
            ], 400);
        }

        // Check if there is already a pending request
        $pendingRequestExists = FeedbackRequest::where('employee_id', $employeeId)
            ->where('status', 'pending')
            ->exists();
        if ($pendingRequestExists) {
            return response()->json([
                'message' => 'A feedback request has already been sent to this employee.',
            ], 400);
        }

        // Create feedback request
        FeedbackRequest::create([
            'sent_by' => $request->user()->id,
            'employee_id' => $employeeId,
            'status' => 'pending',
            'sent_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Feedback request sent successfully.',
        ]);
    }

    /**
     * Get all employees and their survey status.
     * GET api/hr/feedback/employees
     * GET api/admin/feedback/employees
     */
    public function employeeStatuses(Request $request): JsonResponse
    {
        $employees = User::role('employee')->with(['employee.department'])->get();
        
        $data = $employees->map(function ($user) {
            $hasSubmitted = FeedbackSurvey::where('employee_id', $user->id)->exists();
            $pendingRequest = FeedbackRequest::where('employee_id', $user->id)->where('status', 'pending')->first();
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'employee_code' => $user->employee ? $user->employee->employee_code : 'N/A',
                'designation' => $user->employee ? $user->employee->designation : 'N/A',
                'department' => ($user->employee && $user->employee->department) ? $user->employee->department->name : 'N/A',
                'status' => $hasSubmitted ? 'submitted' : ($pendingRequest ? 'pending' : 'none'),
                'request_id' => $pendingRequest ? $pendingRequest->id : null,
                'sent_at' => $pendingRequest ? $pendingRequest->sent_at->toDateTimeString() : null,
            ];
        });

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * View all submissions (HR Manager).
     * GET api/hr/feedback
     */
    public function hrIndex(Request $request): JsonResponse
    {
        $submissions = FeedbackSurvey::with(['employee.employee.department'])
            ->latest()
            ->get();

        return response()->json([
            'data' => FeedbackResource::collection($submissions),
        ]);
    }

    /**
     * View all submissions (Super Admin).
     * GET api/admin/feedback
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $submissions = FeedbackSurvey::with(['employee.employee.department'])
            ->latest()
            ->get();

        return response()->json([
            'data' => FeedbackResource::collection($submissions),
        ]);
    }
}
