<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles and permissions
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_user_can_login_with_correct_credentials()
    {
        $password = 'password123';
        $user = User::factory()->create([
            'email' => 'test@crm.com',
            'password' => Hash::make($password),
            'is_active' => true,
        ]);
        $user->assignRole('employee');

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@crm.com',
            'password' => $password,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'roles', 'permissions'],
                'token',
                'roles',
            ]);
    }

    public function test_user_cannot_login_with_incorrect_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@crm.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@crm.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_inactive_user_cannot_login()
    {
        $password = 'password123';
        $user = User::factory()->create([
            'email' => 'inactive@crm.com',
            'password' => Hash::make($password),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inactive@crm.com',
            'password' => $password,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_get_me_when_authenticated()
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);
        $user->assignRole('employee');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'roles', 'permissions'],
            ]);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        $user->assignRole('employee');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Logged out successfully']);
    }

    public function test_user_can_change_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('old_password123'),
        ]);
        $user->assignRole('employee');

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/auth/change-password', [
            'current_password' => 'old_password123',
            'new_password' => 'new_password123',
            'new_password_confirmation' => 'new_password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Password updated successfully.']);

        $this->assertTrue(Hash::check('new_password123', $user->fresh()->password));
    }

    public function test_user_can_update_profile()
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'phone' => '1111111111',
        ]);
        $user->assignRole('employee');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/auth/profile', [
            'name' => 'New Name',
            'email' => $user->email,
            'phone' => '2222222222',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Name', 'phone' => '2222222222']);

        $this->assertEquals('New Name', $user->fresh()->name);
        $this->assertEquals('2222222222', $user->fresh()->phone);
    }

    public function test_user_can_register_as_employee_and_creates_employee_profile()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Registered Employee',
            'email' => 'registered@crm.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'employee',
            'phone' => '5555555555',
            'designation' => 'Junior Engineer',
            'joining_date' => '2026-06-01',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'roles', 'employee'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'registered@crm.com',
        ]);

        $this->assertDatabaseHas('employees', [
            'designation' => 'Junior Engineer',
        ]);
    }
}
