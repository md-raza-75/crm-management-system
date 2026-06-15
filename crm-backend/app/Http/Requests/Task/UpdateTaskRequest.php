<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'sometimes|required|exists:users,id',
            'priority' => 'sometimes|required|string|in:low,medium,high,urgent',
            'status' => 'sometimes|required|string|in:pending,in_progress,completed,cancelled,overdue',
            'due_date' => 'sometimes|required|date',
        ];
    }
}
