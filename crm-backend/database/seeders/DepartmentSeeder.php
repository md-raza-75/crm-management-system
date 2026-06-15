<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Engineering',
                'description' => 'Product engineering and software development.',
                'is_active' => true,
            ],
            [
                'name' => 'Human Resources',
                'description' => 'Talent management, employee relations, recruitment, and onboarding.',
                'is_active' => true,
            ],
            [
                'name' => 'Sales & Marketing',
                'description' => 'Customer acquisition, lead management, marketing campaigns, and public relations.',
                'is_active' => true,
            ],
            [
                'name' => 'Customer Support',
                'description' => 'Customer success, ticket resolution, and technical support services.',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(['name' => $department['name']], $department);
        }
    }
}
