<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
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
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['assigned_to', 'assigned_by', 'status', 'priority', 'search']);

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

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $creator = $request->user();
        $task = $this->taskService->createTask($request->validated(), $creator->id);
        $task->load(['assignee', 'assignor']);

        return response()->json([
            'message' => 'Task created and assigned successfully.',
            'data' => new TaskResource($task),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $task = $this->taskService->findTaskById($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        return response()->json([
            'data' => new TaskResource($task),
        ]);
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $updated = $this->taskService->updateTask($id, $request->validated());

        if (!$updated) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        $task = $this->taskService->findTaskById($id);

        return response()->json([
            'message' => 'Task updated successfully.',
            'data' => new TaskResource($task),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->taskService->deleteTask($id);

        if (!$deleted) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
    }
}
