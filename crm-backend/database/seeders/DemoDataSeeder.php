<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get departments
        $hrDept = Department::where('name', 'Human Resources')->first();
        $engDept = Department::where('name', 'Engineering')->first();

        $hrRole = Role::findByName('hr_manager', 'web');
        $empRole = Role::findByName('employee', 'web');

        // 1. Seed HR Manager
        $hrUser = User::firstOrCreate(
            ['email' => 'hr@crm.com'],
            [
                'name' => 'HR Manager',
                'password' => Hash::make('password'),
                'is_active' => true,
                'phone' => '1234567890',
            ]
        );
        $hrUser->assignRole($hrRole);

        Employee::firstOrCreate(
            ['user_id' => $hrUser->id],
            [
                'employee_code' => 'EMP-00001',
                'department_id' => $hrDept ? $hrDept->id : null,
                'designation' => 'Senior HR Specialist',
                'joining_date' => '2026-01-01',
                'salary' => 65000.00,
                'employment_type' => 'full_time',
                'status' => 'active',
                'gender' => 'female',
            ]
        );

        // 2. Seed Employee
        $empUser = User::firstOrCreate(
            ['email' => 'employee@crm.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'is_active' => true,
                'phone' => '9876543210',
            ]
        );
        $empUser->assignRole($empRole);

        Employee::firstOrCreate(
            ['user_id' => $empUser->id],
            [
                'employee_code' => 'EMP-00002',
                'department_id' => $engDept ? $engDept->id : null,
                'designation' => 'Software Engineer',
                'joining_date' => '2026-03-01',
                'salary' => 85000.00,
                'employment_type' => 'full_time',
                'status' => 'active',
                'gender' => 'male',
            ]
        );
    }
}
