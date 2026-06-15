<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Carbon\Carbon;

class TaskService
{
    protected $taskRepository;

    public function __construct(TaskRepositoryInterface $taskRepository)
    {
        $this->taskRepository = $taskRepository;
    }

    public function paginateTasks(int $perPage = 15, array $filters = [])
    {
        return $this->taskRepository->paginate($perPage, $filters);
    }

    public function findTaskById(int $id)
    {
        return $this->taskRepository->findById($id);
    }

    public function createTask(array $data, int $creatorId): Task
    {
        return $this->taskRepository->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'assigned_to' => $data['assigned_to'],
            'assigned_by' => $creatorId,
            'priority' => $data['priority'] ?? 'medium',
            'status' => 'pending',
            'due_date' => $data['due_date'],
        ]);
    }

    public function updateTask(int $id, array $data): bool
    {
        if (isset($data['status']) && $data['status'] === 'completed') {
            $data['completed_at'] = Carbon::now();
        }

        return $this->taskRepository->update($id, $data);
    }

    public function updateTaskStatus(int $id, int $userId, array $data): bool
    {
        $task = Task::find($id);
        if (!$task) {
            return false;
        }

        if ($task->assigned_to !== $userId) {
            throw new \Exception('Unauthorized to update this task status.');
        }

        $updateData = ['status' => $data['status']];
        if ($data['status'] === 'completed') {
            $updateData['completed_at'] = Carbon::now();
        } else {
            $updateData['completed_at'] = null;
        }

        return $this->taskRepository->update($id, $updateData);
    }

    public function deleteTask(int $id): bool
    {
        return $this->taskRepository->delete($id);
    }
}
