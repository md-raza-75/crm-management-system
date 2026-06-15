<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'max_days_per_year',
        'is_paid',
        'is_active',
    ];

    protected $casts = [
        'max_days_per_year' => 'integer',
        'is_paid' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }
}
