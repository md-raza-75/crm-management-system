<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
        $permissions = [
            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.view_own',
            'users.edit_own',
            
            // Employees
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',
            'employees.view_own',
            
            // Departments
            'departments.view',
            'departments.create',
            'departments.edit',
            'departments.delete',
            
            // Attendance
            'attendance.view',
            'attendance.view_own',
            'attendance.clock',
            'attendance.manage',
            
            // Leaves
            'leaves.view',
            'leaves.view_own',
            'leaves.create',
            'leaves.approve',
            'leaves.manage_types',
            
            // Tasks
            'tasks.view',
            'tasks.view_own',
            'tasks.create',
            'tasks.edit',
            'tasks.delete',
            'tasks.update_status',
            
            // Reports
            'reports.view',
            'reports.generate',
            'reports.export',
            
            // Audit/Activity Logs
            'activity_logs.view',
            
            // Notifications
            'notifications.view',
            'notifications.manage',
            
            // Dashboards
            'dashboard.admin',
            'dashboard.hr',
            'dashboard.employee',
        ];

        // Create permissions for web guard
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign existing permissions
        
        // Employee Role
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        $employeeRole->syncPermissions([
            'users.view_own',
            'users.edit_own',
            'employees.view_own',
            'departments.view',
            'attendance.view_own',
            'attendance.clock',
            'leaves.view_own',
            'leaves.create',
            'tasks.view_own',
            'tasks.update_status',
            'notifications.view',
            'dashboard.employee',
        ]);

        // HR Manager Role
        $hrRole = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
        $hrRole->syncPermissions([
            'users.view',
            'users.view_own',
            'users.edit_own',
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',
            'employees.view_own',
            'departments.view',
            'attendance.view',
            'attendance.view_own',
            'attendance.clock',
            'attendance.manage',
            'leaves.view',
            'leaves.view_own',
            'leaves.create',
            'leaves.approve',
            'tasks.view',
            'tasks.view_own',
            'tasks.create',
            'tasks.edit',
            'tasks.delete',
            'tasks.update_status',
            'reports.view',
            'reports.generate',
            'notifications.view',
            'dashboard.hr',
            'dashboard.employee',
        ]);

        // Super Admin Role (gives all permissions)
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions(Permission::where('guard_name', 'web')->get());
    }
}
