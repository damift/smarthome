<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Room;
use App\Models\Type;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        // Haal de kamers op (Zorg dat de namen matchen met je RoomSeeder)
        $livingRoom = Room::where('name', 'Living Room')->first();
        $bedroom = Room::where('name', 'Bedroom')->first();
        $kitchen = Room::where('name', 'Kitchen')->first();

        // Haal de types op (Exacte match met je TypeSeeder hoofdletters)
        $light = Type::where('name', 'LIGHT')->first();
        $thermostat = Type::where('name', 'THERMOSTAT')->first();
        $camera = Type::where('name', 'CAMERA')->first();
        $outlet = Type::where('name', 'OUTLET')->first();

        // Voorbeeld data array om de code korter en leesbaar te houden
        $devices = [
            // Living Room
            ['name' => 'Main Ceiling Light', 'room' => $livingRoom, 'type' => $light],
            ['name' => 'Corner Lamp', 'room' => $livingRoom, 'type' => $light],
            ['name' => 'Living Room Thermostat', 'room' => $livingRoom, 'type' => $thermostat],
            ['name' => 'Security Camera', 'room' => $livingRoom, 'type' => $camera],

            // Bedroom
            ['name' => 'Bedroom Light', 'room' => $bedroom, 'type' => $light],
            ['name' => 'Bedroom Thermostat', 'room' => $bedroom, 'type' => $thermostat],

            // Kitchen
            ['name' => 'Kitchen Light', 'room' => $kitchen, 'type' => $light],
            ['name' => 'Smart Outlet', 'room' => $kitchen, 'type' => $outlet],
        ];

foreach ($devices as $item) {
            if ($item['room'] && $item['type']) {
                // 1. Maak het object aan in het geheugen (nog niet opslaan)
                $device = new Device([
                    'name' => $item['name'],
                    'room_id' => $item['room']->id,
                    'type_id' => $item['type']->id,
                ]);

                // 2. Genereer de status handmatig via de methode in je Model
                // Dit zorgt ervoor dat we niet afhankelijk zijn van "events" die soms niet vuren
                $device->state = $device->generateDefaultState();

                // 3. Opslaan of bijwerken
                Device::updateOrCreate(
                    ['name' => $item['name']],
                    [
                        'room_id' => $device->room_id,
                        'type_id' => $device->type_id,
                        'state'   => $device->state, // Nu geven we het expliciet mee!
                    ]
                );
            }
        }
    }
}