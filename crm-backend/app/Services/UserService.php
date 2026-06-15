<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class UserService
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function paginateUsers(int $perPage = 15)
    {
        return User::with(['roles', 'permissions', 'employee'])->latest()->paginate($perPage);
    }

    public function findUserById(int $id)
    {
        return User::with(['roles', 'permissions', 'employee.department'])->find($id);
    }

    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            // Assign Spatie Role using the web guard
            $roleName = $data['role'] ?? 'employee';
            $role = Role::findByName($roleName, 'web');
            $user->assignRole($role);

            return $user;
        });
    }

    public function updateUser(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $user = User::find($id);
            if (!$user) {
                return false;
            }

            $updateData = [];
            if (isset($data['name'])) $updateData['name'] = $data['name'];
            if (isset($data['email'])) $updateData['email'] = $data['email'];
            if (isset($data['phone'])) $updateData['phone'] = $data['phone'];
            if (isset($data['is_active'])) $updateData['is_active'] = $data['is_active'];
            
            if (!empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            $user->update($updateData);

            // Update role if provided
            if (!empty($data['role'])) {
                $role = Role::findByName($data['role'], 'web');
                $user->syncRoles([$role]);
            }

            return true;
        });
    }

    public function toggleUserStatus(int $id): bool
    {
        $user = User::find($id);
        if (!$user) {
            return false;
        }

        $user->is_active = !$user->is_active;
        return $user->save();
    }

    public function deleteUser(int $id): bool
    {
        return $this->userRepository->delete($id);
    }
}
