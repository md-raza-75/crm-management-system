<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\UserRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(\App\Repositories\Contracts\DepartmentRepositoryInterface::class, \App\Repositories\DepartmentRepository::class);
        $this->app->bind(\App\Repositories\Contracts\EmployeeRepositoryInterface::class, \App\Repositories\EmployeeRepository::class);
        $this->app->bind(\App\Repositories\Contracts\AttendanceRepositoryInterface::class, \App\Repositories\AttendanceRepository::class);
        $this->app->bind(\App\Repositories\Contracts\LeaveRepositoryInterface::class, \App\Repositories\LeaveRepository::class);
        $this->app->bind(\App\Repositories\Contracts\TaskRepositoryInterface::class, \App\Repositories\TaskRepository::class);
        $this->app->bind(\App\Repositories\Contracts\ReportRepositoryInterface::class, \App\Repositories\ReportRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
