<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leaveTypes = [
            [
                'name' => 'Casual Leave',
                'max_days_per_year' => 12,
                'is_paid' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Sick Leave',
                'max_days_per_year' => 10,
                'is_paid' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Maternity Leave',
                'max_days_per_year' => 90,
                'is_paid' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Paternity Leave',
                'max_days_per_year' => 15,
                'is_paid' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Unpaid Leave',
                'max_days_per_year' => 365,
                'is_paid' => false,
                'is_active' => true,
            ],
        ];

        foreach ($leaveTypes as $leaveType) {
            LeaveType::firstOrCreate(['name' => $leaveType['name']], $leaveType);
        }
    }
}
