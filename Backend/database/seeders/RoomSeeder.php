<?php

namespace Database\Seeders;

use App\Models\Rooms;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'name' => 'Living Room',
                'devices' => [
                    ['name' => 'Light 1', 'type' => 'lightbulb', 'active' => true],
                    ['name' => 'Light 2', 'type' => 'lightbulb', 'active' => true],
                    ['name' => 'Thermostat', 'type' => 'thermostat', 'active' => false],
                    ['name' => 'Camera', 'type' => 'camera', 'active' => true],
                ]
            ],
            [
                'name' => 'Bedroom',
                'devices' => [
                    ['name' => 'Light', 'type' => 'lightbulb', 'active' => false],
                    ['name' => 'Thermostat', 'type' => 'thermostat', 'active' => true],
                    ['name' => 'Door Lock', 'type' => 'lock', 'active' => false],
                ]
            ],
            [
                'name' => 'Kitchen',
                'devices' => [
                    ['name' => 'Light 1', 'type' => 'lightbulb', 'active' => true],
                    ['name' => 'Light 2', 'type' => 'lightbulb', 'active' => true],
                    ['name' => 'Motion Sensor', 'type' => 'motion', 'active' => true],
                ]
            ],
            [
                'name' => 'Bathroom',
                'devices' => [
                    ['name' => 'Light', 'type' => 'lightbulb', 'active' => false],
                    ['name' => 'Motion Sensor', 'type' => 'motion', 'active' => true],
                ]
            ],
            [
                'name' => 'Garage',
                'devices' => [
                    ['name' => 'Light', 'type' => 'lightbulb', 'active' => false],
                    ['name' => 'Door Lock', 'type' => 'lock', 'active' => true],
                    ['name' => 'Camera', 'type' => 'camera', 'active' => false],
                ]
            ]
        ];

        foreach ($rooms as $roomData) {
            $room = Rooms::create([
                'name' => $roomData['name'],
            ]);

            // Seed devices als ze in de tabel voorkomen
            foreach ($roomData['devices'] as $device) {
                // Je kunt dit aanpassen afhankelijk van je Device model
                // $room->devices()->create($device);
            }
        }
    }
}
