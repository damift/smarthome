<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['name' => 'Living Room'],
            ['name' => 'Bedroom'],
            ['name' => 'Kitchen'],
            ['name' => 'Bathroom'],
            ['name' => 'Garage'],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}