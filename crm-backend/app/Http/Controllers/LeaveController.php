<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    // Get leaves
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isSuperAdmin() || $user->isHrManager()) {
            $leaves = Leave::with(['user', 'approver'])->get();
        } else {
            $leaves = Leave::with(['user', 'approver'])
                ->where('user_id', $user->id)
                ->get();
        }
        
        return response()->json($leaves);
    }

    // Apply for leave (Employee)
    public function store(Request $request)
    {
        $request->validate([
            'reason' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date'
        ]);

        $leave = Leave::create([
            'user_id' => $request->user()->id,
            'reason' => $request->reason,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => 'pending'
        ]);

        return response()->json($leave->load('user'), 201);
    }

    // Approve/Reject leave (HR/Admin)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'remarks' => 'nullable|string'
        ]);

        $leave = Leave::findOrFail($id);
        $leave->update([
            'status' => $request->status,
            'remarks' => $request->remarks,
            'approved_by' => $request->user()->id
        ]);

        return response()->json($leave->load(['user', 'approver']));
    }
}