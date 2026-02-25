<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Rooms;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get rooms by name
        $livingRoom = Rooms::where('name', 'Living Room')->first();
        $bedroom = Rooms::where('name', 'Bedroom')->first();
        $kitchen = Rooms::where('name', 'Kitchen')->first();

        if ($livingRoom) {
            Device::create([
                'name' => 'Main Ceiling Light',
                'type' => 'LIGHT',
                'room_id' => $livingRoom->id,
                'status' => 'ON',
                'icon' => '💡',
            ]);

            Device::create([
                'name' => 'Corner Lamp',
                'type' => 'LIGHT',
                'room_id' => $livingRoom->id,
                'status' => 'OFF',
                'icon' => '💡',
            ]);

            Device::create([
                'name' => 'Living Room Thermostat',
                'type' => 'THERMOSTAT',
                'room_id' => $livingRoom->id,
                'status' => 'ON',
                'icon' => '🌡️',
            ]);

            Device::create([
                'name' => 'Security Camera',
                'type' => 'CAMERA',
                'room_id' => $livingRoom->id,
                'status' => 'ON',
                'icon' => '📷',
            ]);
        }

        if ($bedroom) {
            Device::create([
                'name' => 'Bedroom Light',
                'type' => 'LIGHT',
                'room_id' => $bedroom->id,
                'status' => 'OFF',
                'icon' => '💡',
            ]);

            Device::create([
                'name' => 'Bedroom Thermostat',
                'type' => 'THERMOSTAT',
                'room_id' => $bedroom->id,
                'status' => 'ON',
                'icon' => '🌡️',
            ]);
        }

        if ($kitchen) {
            Device::create([
                'name' => 'Kitchen Light',
                'type' => 'LIGHT',
                'room_id' => $kitchen->id,
                'status' => 'ON',
                'icon' => '💡',
            ]);

            Device::create([
                'name' => 'Smart Outlet',
                'type' => 'OUTLET',
                'room_id' => $kitchen->id,
                'status' => 'OFF',
                'icon' => '🔌',
            ]);
        }
    }
}

