<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthService
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Register a new user and create their employee profile if they are an employee.
     */
    public function register(array $data): array
    {
        // Default role is employee if not specified
        $roleName = $data['role'] ?? 'employee';

        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        $role = Role::findByName($roleName, 'web');
        $user->assignRole($role);

        // Create employee profile if user is an employee or HR manager
        if (in_array($roleName, ['employee', 'hr_manager'])) {
            Employee::create([
                'user_id' => $user->id,
                'employee_code' => 'EMP' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'designation' => $data['designation'] ?? ($roleName === 'hr_manager' ? 'HR Specialist' : 'Staff'),
                'joining_date' => $data['joining_date'] ?? now()->toDateString(),
                'salary' => $data['salary'] ?? null,
                'status' => 'active',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['employee', 'roles', 'permissions']),
            'token' => $token,
        ];
    }

    /**
     * Authenticate a user and return their token and user details.
     */
    public function login(array $credentials): array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact the administrator.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['employee', 'roles', 'permissions']),
            'token' => $token,
        ];
    }

    /**
     * Revoke the current user's access token.
     */
    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        } else {
            $user->tokens()->delete();
        }
    }
}
