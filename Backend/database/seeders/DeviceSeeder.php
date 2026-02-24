<?php

namespace Database\Seeders;

use App\Models\Device;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Device::create([
            'name' => 'Main Ceiling Light',
            'type' => 'LIGHT',
            'room' => 'Living Room',
            'status' => 'ON',
            'icon' => '💡',
        ]);

        Device::create([
            'name' => 'Corner Lamp',
            'type' => 'LIGHT',
            'room' => 'Living Room',
            'status' => 'OFF',
            'icon' => '💡',
        ]);

        Device::create([
            'name' => 'Living Room Thermostat',
            'type' => 'THERMOSTAT',
            'room' => 'Living Room',
            'status' => 'ON',
            'icon' => '🌡️',
        ]);

        Device::create([
            'name' => 'Security Camera',
            'type' => 'CAMERA',
            'room' => 'Living Room',
            'status' => 'ON',
            'icon' => '📷',
        ]);

        Device::create([
            'name' => 'Bedroom Light',
            'type' => 'LIGHT',
            'room' => 'Bedroom',
            'status' => 'OFF',
            'icon' => '💡',
        ]);

        Device::create([
            'name' => 'Bedroom Thermostat',
            'type' => 'THERMOSTAT',
            'room' => 'Bedroom',
            'status' => 'ON',
            'icon' => '🌡️',
        ]);

        Device::create([
            'name' => 'Kitchen Light',
            'type' => 'LIGHT',
            'room' => 'Kitchen',
            'status' => 'ON',
            'icon' => '💡',
        ]);

        Device::create([
            'name' => 'Smart Outlet',
            'type' => 'OUTLET',
            'room' => 'Kitchen',
            'status' => 'OFF',
            'icon' => '🔌',
        ]);
    }
}
