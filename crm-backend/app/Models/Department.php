<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'head_user_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function headUser()
    {
        return $this->belongsTo(User::class, 'head_user_id');
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
