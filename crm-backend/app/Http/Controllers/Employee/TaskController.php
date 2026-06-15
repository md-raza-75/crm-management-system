<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['status', 'priority', 'search']);
        $filters['assigned_to'] = $user->id; // Enforce own assigned tasks only

        $tasks = $this->taskService->paginateTasks($perPage, $filters);

        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $task = $this->taskService->findTaskById($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        if ($task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized to view this task.'], 403);
        }

        return response()->json([
            'data' => new TaskResource($task),
        ]);
    }

    public function updateStatus(UpdateTaskStatusRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $updated = $this->taskService->updateTaskStatus($id, $user->id, $request->validated());

            if (!$updated) {
                return response()->json(['message' => 'Task not found.'], 404);
            }

            $task = $this->taskService->findTaskById($id);

            return response()->json([
                'message' => 'Task status updated successfully.',
                'data' => new TaskResource($task),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
