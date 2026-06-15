<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Align Spatie permission guards with Laravel's default web guard.
     */
    public function up(): void
    {
        DB::table('permissions')->where('guard_name', 'sanctum')->update(['guard_name' => 'web']);
        DB::table('roles')->where('guard_name', 'sanctum')->update(['guard_name' => 'web']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('permissions')->where('guard_name', 'web')->update(['guard_name' => 'sanctum']);
        DB::table('roles')->where('guard_name', 'web')->update(['guard_name' => 'sanctum']);
    }
};
