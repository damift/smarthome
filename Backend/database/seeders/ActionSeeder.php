<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Action; // Zorg dat je dit model hebt aangemaakt
use Illuminate\Support\Facades\DB;

class ActionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $actions = [
            // Binaire acties (Aan/Uit)
            [
                'name' => 'TURN_ON',
                'description' => 'Zet het apparaat aan',
                'value_type' => 'BOOLEAN',
            ],
            [
                'name' => 'TURN_OFF',
                'description' => 'Zet het apparaat uit',
                'value_type' => 'BOOLEAN',
            ],
            
            // Variabele instellingen
            [
                'name' => 'SET_TEMPERATURE',
                'description' => 'Stel de temperatuur in (Celsius)',
                'value_type' => 'DECIMAL',
            ],
            [
                'name' => 'SET_BRIGHTNESS',
                'description' => 'Stel de helderheid in (0-100)',
                'value_type' => 'INT',
            ],
            [
                'name' => 'SET_COLOR',
                'description' => 'Stel de kleur in (Hex code)',
                'value_type' => 'STRING',
            ],
            
            // Media acties
            [
                'name' => 'SET_VOLUME',
                'description' => 'Stel het volumeniveau in',
                'value_type' => 'INT',
            ],
            [
                'name' => 'PLAY_PAUSE',
                'description' => 'Start of pauzeer media',
                'value_type' => 'BOOLEAN',
            ],

            // Beveiliging
            [
                'name' => 'LOCK_DOOR',
                'description' => 'Vergrendel de deur of het slot',
                'value_type' => 'BOOLEAN',
            ],
        ];

        foreach ($actions as $action) {
            DB::table('actions')->updateOrInsert(
                ['name' => $action['name']], // Check op unieke naam
                array_merge($action, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}