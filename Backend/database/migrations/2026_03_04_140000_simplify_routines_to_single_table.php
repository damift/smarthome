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
        if (!Schema::hasColumn('routines', 'steps')) {
            Schema::table('routines', function (Blueprint $table) {
                $table->json('steps')->nullable()->after('icon');
            });
        }

        if (Schema::hasTable('routine_steps')) {
            $groupedSteps = [];

            DB::table('routine_steps')
                ->orderBy('routine_id')
                ->orderBy('position')
                ->orderBy('id')
                ->get()
                ->each(function ($step) use (&$groupedSteps) {
                    $routineId = (int) $step->routine_id;

                    if (!isset($groupedSteps[$routineId])) {
                        $groupedSteps[$routineId] = [];
                    }

                    $groupedSteps[$routineId][] = [
                        'position' => (int) $step->position,
                        'summary' => $step->summary,
                        'room_name' => $step->room_name,
                        'type_name' => $step->type_name,
                        'device_name' => $step->device_name,
                        'action_name' => $step->action_name,
                        'value' => $step->value,
                    ];
                });

            foreach ($groupedSteps as $routineId => $steps) {
                DB::table('routines')
                    ->where('id', $routineId)
                    ->update([
                        'steps' => json_encode($steps),
                        'updated_at' => now(),
                    ]);
            }

            Schema::drop('routine_steps');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('routine_steps')) {
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
        }

        DB::table('routines')->orderBy('id')->get()->each(function ($routine) {
            $steps = json_decode((string) ($routine->steps ?? '[]'), true);
            if (!is_array($steps)) {
                return;
            }

            $insertRows = [];
            foreach ($steps as $index => $step) {
                if (!is_array($step)) {
                    continue;
                }

                $insertRows[] = [
                    'routine_id' => $routine->id,
                    'position' => (int) ($step['position'] ?? $index + 1),
                    'summary' => $step['summary'] ?? null,
                    'room_name' => $step['room_name'] ?? null,
                    'type_name' => $step['type_name'] ?? null,
                    'device_name' => $step['device_name'] ?? null,
                    'action_name' => $step['action_name'] ?? '',
                    'value' => array_key_exists('value', $step) ? (string) $step['value'] : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($insertRows)) {
                DB::table('routine_steps')->insert($insertRows);
            }
        });

        if (Schema::hasColumn('routines', 'steps')) {
            Schema::table('routines', function (Blueprint $table) {
                $table->dropColumn('steps');
            });
        }
    }
};

