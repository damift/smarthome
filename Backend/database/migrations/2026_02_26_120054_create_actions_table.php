<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // TURN_ON, TURN_OFF, SET_TEMPERATURE, etc.
            $table->string('description')->nullable();
            $table->string('value_type')->nullable(); // INT, DECIMAL, BOOLEAN, NULL
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('actions');
    }
};