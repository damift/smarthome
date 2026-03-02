<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypeActionSeeder extends Seeder
{
    public function run(): void
    {
        // Haal de ID's op (Nu met hoofdletters zoals in je TypeSeeder)
        $types = DB::table('types')->pluck('id', 'name');
        $actions = DB::table('actions')->pluck('id', 'name');

        // De keys hieronder moeten EXACT overeenkomen met de waarden in je TypeSeeder array
        $mappings = [
            'LIGHT' => [
                'TURN_ON',
                'TURN_OFF',
                'SET_BRIGHTNESS',
                'SET_COLOR'
            ],
            'THERMOSTAT' => [
                'SET_TEMPERATURE'
            ],
            'OUTLET' => [ // Komt overeen met je 'OUTLET' type
                'TURN_ON',
                'TURN_OFF'
            ],
            'CAMERA' => [
                // Voeg hier acties toe als je die hebt, bijv. 'RECORD'
            ],
        ];

        $data = [];

        foreach ($mappings as $typeName => $actionNames) {
            if (isset($types[$typeName])) {
                foreach ($actionNames as $actionName) {
                    if (isset($actions[$actionName])) {
                        $data[] = [
                            'type_id' => $types[$typeName],
                            'action_id' => $actions[$actionName],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }
        }

        if (!empty($data)) {
            DB::table('type_action')->insertOrIgnore($data);
        }
    }
}