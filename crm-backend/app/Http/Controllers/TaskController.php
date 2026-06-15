<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // Get tasks (filtered by role)
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isSuperAdmin() || $user->isHrManager()) {
            $tasks = Task::with(['assignor', 'assignee'])->get();
        } else {
            $tasks = Task::with(['assignor', 'assignee'])
                ->where('assigned_to', $user->id)
                ->get();
        }
        
        return response()->json($tasks);
    }

    // Create task (HR/Admin only)
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:users,id',
            'due_date' => 'required|date'
        ]);

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'assigned_by' => $request->user()->id,
            'assigned_to' => $request->assigned_to,
            'due_date' => $request->due_date,
            'status' => 'pending'
        ]);

        return response()->json($task->load(['assignor', 'assignee']), 201);
    }

    // Update task status
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed'
        ]);

        $task = Task::findOrFail($id);
        
        // Check if user is assigned to this task or is admin
        if ($request->user()->role === 'employee' && $task->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->update(['status' => $request->status]);
        return response()->json($task);
    }

    // Delete task (HR/Admin only)
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }
}