<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeedbackSurvey extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'is_anonymous',
        'answers',
        'submitted_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'answers' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }
}
