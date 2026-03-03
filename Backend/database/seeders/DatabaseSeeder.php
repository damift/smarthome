<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@gmail.com',
            'role' => 'admin',
            'password' => \Illuminate\Support\Facades\Hash::make('123456789'),
        ]);

        // Seed rooms
        $this->call(RoomSeeder::class);
        
        // Seed types
        $this->call(TypeSeeder::class);



        // Seed actions
        $this->call(ActionSeeder::class);

        // Seed type-action 
        $this->call(TypeActionSeeder::class);
        
        // Seed devices
        $this->call(DeviceSeeder::class);

    }
}
