<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class EmployeeService
{
    protected $employeeRepository;
    protected $userRepository;

    public function __construct(
        EmployeeRepositoryInterface $employeeRepository,
        UserRepositoryInterface $userRepository
    ) {
        $this->employeeRepository = $employeeRepository;
        $this->userRepository = $userRepository;
    }

    public function paginateEmployees(int $perPage = 15, array $filters = [])
    {
        return $this->employeeRepository->paginate($perPage, $filters);
    }

    public function findEmployeeById(int $id)
    {
        return $this->employeeRepository->findById($id);
    }

    public function createEmployee(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            // 1. Create User
            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password'), // Default password if not provided
                'phone' => $data['phone'] ?? null,
                'is_active' => true,
            ]);

            // 2. Assign Role (default employee, could be hr_manager)
            $roleName = $data['role'] ?? 'employee';
            $role = Role::findByName($roleName, 'web');
            $user->assignRole($role);

            // 3. Generate employee code if not provided
            $empCode = $data['employee_code'] ?? 'EMP' . str_pad($user->id, 5, '0', STR_PAD_LEFT);

            // 4. Create Employee Profile
            return $this->employeeRepository->create([
                'user_id' => $user->id,
                'employee_code' => $empCode,
                'department_id' => $data['department_id'] ?? null,
                'designation' => $data['designation'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'zip_code' => $data['zip_code'] ?? null,
                'joining_date' => $data['joining_date'] ?? now()->toDateString(),
                'salary' => $data['salary'] ?? null,
                'employment_type' => $data['employment_type'] ?? 'full_time',
                'status' => $data['status'] ?? 'active',
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
            ]);
        });
    }

    public function updateEmployee(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $employee = Employee::find($id);
            if (!$employee) {
                return false;
            }

            // Update associated User details
            $user = $employee->user;
            if ($user) {
                $userData = [];
                if (isset($data['name'])) $userData['name'] = $data['name'];
                if (isset($data['email'])) $userData['email'] = $data['email'];
                if (isset($data['phone'])) $userData['phone'] = $data['phone'];
                if (!empty($data['password'])) {
                    $userData['password'] = Hash::make($data['password']);
                }
                $user->update($userData);

                // Update Role if provided
                if (!empty($data['role'])) {
                    $role = Role::findByName($data['role'], 'web');
                    $user->syncRoles([$role]);
                }
            }

            // Update Employee Profile details
            $employeeData = [];
            $fields = [
                'department_id', 'designation', 'date_of_birth', 'gender',
                'address', 'city', 'state', 'zip_code', 'joining_date',
                'salary', 'employment_type', 'status',
                'emergency_contact_name', 'emergency_contact_phone'
            ];

            foreach ($fields as $field) {
                if (isset($data[$field])) {
                    $employeeData[$field] = $data[$field];
                }
            }

            // Update Employee status inside User table if needed (e.g. if employee status becomes inactive/terminated)
            if (isset($data['status']) && in_array($data['status'], ['inactive', 'terminated'])) {
                $user->update(['is_active' => false]);
            } elseif (isset($data['status']) && $data['status'] === 'active') {
                $user->update(['is_active' => true]);
            }

            return $employee->update($employeeData);
        });
    }

    public function deleteEmployee(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $employee = Employee::find($id);
            if (!$employee) {
                return false;
            }

            // Deactivate associated user account
            $user = $employee->user;
            if ($user) {
                $user->update(['is_active' => false]);
            }

            return $employee->delete();
        });
    }
}
