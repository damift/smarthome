<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            $types = ['LIGHT', 'THERMOSTAT', 'CAMERA', 'OUTLET'];


        foreach ($types as $type) {
            DB::table('types')->insert([
                'name' => $type,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}