<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Get attendance
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isSuperAdmin() || $user->isHrManager()) {
            $attendances = Attendance::with('user')->get();
        } else {
            $attendances = Attendance::with('user')
                ->where('user_id', $user->id)
                ->get();
        }
        
        return response()->json($attendances);
    }

    // Clock In
    public function clockIn(Request $request)
    {
        $today = Attendance::where('user_id', $request->user()->id)
            ->where('date', today())
            ->first();

        if ($today) {
            return response()->json(['message' => 'Already clocked in today'], 400);
        }

        $attendance = Attendance::create([
            'user_id' => $request->user()->id,
            'date' => today(),
            'clock_in' => now()->format('H:i:s'),
            'status' => 'present'
        ]);

        return response()->json($attendance);
    }

    // Clock Out
    public function clockOut(Request $request)
    {
        $attendance = Attendance::where('user_id', $request->user()->id)
            ->where('date', today())
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'Please clock in first'], 400);
        }

        if ($attendance->clock_out) {
            return response()->json(['message' => 'Already clocked out'], 400);
        }

        $attendance->update(['clock_out' => now()->format('H:i:s')]);
        return response()->json($attendance);
    }
}