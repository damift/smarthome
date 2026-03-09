<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('routines', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('activated_count')->default(0);
            $table->timestamp('last_activated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('routine_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('routine_id')->constrained('routines')->onDelete('cascade');
            $table->unsignedInteger('position')->default(0);
            $table->string('summary')->nullable();
            $table->string('room_name')->nullable();
            $table->string('type_name')->nullable();
            $table->string('device_name')->nullable();
            $table->string('action_name');
            $table->string('value')->nullable();
            $table->timestamps();

            $table->index(['routine_id', 'position']);
        });

        $now = now();

        $routineRows = [
            [
                'slug' => 'workday',
                'title' => 'Workday',
                'description' => 'Optimize for a productive workday',
                'icon' => 'SUN',
                'is_active' => true,
            ],
            [
                'slug' => 'evening',
                'title' => 'Evening',
                'description' => 'Relax and wind down',
                'icon' => 'MOON',
                'is_active' => true,
            ],
            [
                'slug' => 'night',
                'title' => 'Night',
                'description' => 'Prepare the house for sleep',
                'icon' => 'NIGHT',
                'is_active' => true,
            ],
            [
                'slug' => 'vacation',
                'title' => 'Vacation',
                'description' => 'Secure home while away',
                'icon' => 'VACATION',
                'is_active' => true,
            ],
        ];

        $routineIds = [];
        foreach ($routineRows as $routineRow) {
            $routineIds[$routineRow['slug']] = DB::table('routines')->insertGetId([
                ...$routineRow,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $stepRows = [
            // Workday
            [
                'routine_slug' => 'workday',
                'position' => 1,
                'summary' => 'Living Room: Main Ceiling Light -> ON (80%)',
                'room_name' => 'Living Room',
                'device_name' => 'Main Ceiling Light',
                'action_name' => 'TURN_ON',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'workday',
                'position' => 2,
                'summary' => 'Living Room: Main Ceiling Light -> Brightness 80%',
                'room_name' => 'Living Room',
                'device_name' => 'Main Ceiling Light',
                'action_name' => 'SET_BRIGHTNESS',
                'value' => '80',
            ],
            [
                'routine_slug' => 'workday',
                'position' => 3,
                'summary' => 'Living Room: Thermostat -> 22C',
                'room_name' => 'Living Room',
                'type_name' => 'THERMOSTAT',
                'action_name' => 'SET_TEMPERATURE',
                'value' => '22',
            ],
            [
                'routine_slug' => 'workday',
                'position' => 4,
                'summary' => 'Kitchen: All Lights -> ON',
                'room_name' => 'Kitchen',
                'type_name' => 'LIGHT',
                'action_name' => 'TURN_ON',
                'value' => 'true',
            ],

            // Evening
            [
                'routine_slug' => 'evening',
                'position' => 1,
                'summary' => 'Living Room: Main Ceiling Light -> ON (40%)',
                'room_name' => 'Living Room',
                'device_name' => 'Main Ceiling Light',
                'action_name' => 'TURN_ON',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'evening',
                'position' => 2,
                'summary' => 'Living Room: Main Ceiling Light -> Brightness 40%',
                'room_name' => 'Living Room',
                'device_name' => 'Main Ceiling Light',
                'action_name' => 'SET_BRIGHTNESS',
                'value' => '40',
            ],
            [
                'routine_slug' => 'evening',
                'position' => 3,
                'summary' => 'Living Room: Corner Lamp -> ON (50%)',
                'room_name' => 'Living Room',
                'device_name' => 'Corner Lamp',
                'action_name' => 'TURN_ON',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'evening',
                'position' => 4,
                'summary' => 'Living Room: Corner Lamp -> Brightness 50%',
                'room_name' => 'Living Room',
                'device_name' => 'Corner Lamp',
                'action_name' => 'SET_BRIGHTNESS',
                'value' => '50',
            ],
            [
                'routine_slug' => 'evening',
                'position' => 5,
                'summary' => 'Living Room: Thermostat -> 21C',
                'room_name' => 'Living Room',
                'type_name' => 'THERMOSTAT',
                'action_name' => 'SET_TEMPERATURE',
                'value' => '21',
            ],
            [
                'routine_slug' => 'evening',
                'position' => 6,
                'summary' => 'Bedroom: Lights -> ON (20%)',
                'room_name' => 'Bedroom',
                'type_name' => 'LIGHT',
                'action_name' => 'TURN_ON',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'evening',
                'position' => 7,
                'summary' => 'Bedroom: Lights -> Brightness 20%',
                'room_name' => 'Bedroom',
                'type_name' => 'LIGHT',
                'action_name' => 'SET_BRIGHTNESS',
                'value' => '20',
            ],

            // Night
            [
                'routine_slug' => 'night',
                'position' => 1,
                'summary' => 'All Lights -> OFF',
                'type_name' => 'LIGHT',
                'action_name' => 'TURN_OFF',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'night',
                'position' => 2,
                'summary' => 'All Outlets -> OFF',
                'type_name' => 'OUTLET',
                'action_name' => 'TURN_OFF',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'night',
                'position' => 3,
                'summary' => 'All Thermostats -> 18C',
                'type_name' => 'THERMOSTAT',
                'action_name' => 'SET_TEMPERATURE',
                'value' => '18',
            ],

            // Vacation
            [
                'routine_slug' => 'vacation',
                'position' => 1,
                'summary' => 'All Lights -> OFF',
                'type_name' => 'LIGHT',
                'action_name' => 'TURN_OFF',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'vacation',
                'position' => 2,
                'summary' => 'All Outlets -> OFF',
                'type_name' => 'OUTLET',
                'action_name' => 'TURN_OFF',
                'value' => 'true',
            ],
            [
                'routine_slug' => 'vacation',
                'position' => 3,
                'summary' => 'All Thermostats -> 16C',
                'type_name' => 'THERMOSTAT',
                'action_name' => 'SET_TEMPERATURE',
                'value' => '16',
            ],
        ];

        $insertSteps = [];
        foreach ($stepRows as $step) {
            $routineSlug = $step['routine_slug'];
            if (!isset($routineIds[$routineSlug])) {
                continue;
            }

            $insertSteps[] = [
                'routine_id' => $routineIds[$routineSlug],
                'position' => $step['position'],
                'summary' => $step['summary'] ?? null,
                'room_name' => $step['room_name'] ?? null,
                'type_name' => $step['type_name'] ?? null,
                'device_name' => $step['device_name'] ?? null,
                'action_name' => $step['action_name'],
                'value' => $step['value'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($insertSteps)) {
            DB::table('routine_steps')->insert($insertSteps);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routine_steps');
        Schema::dropIfExists('routines');
    }
};

