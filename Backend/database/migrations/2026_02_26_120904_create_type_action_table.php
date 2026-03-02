<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('type_action', function (Blueprint $table) {
            $table->id();
            $table->foreignId('type_id')->constrained()->onDelete('cascade');
            $table->foreignId('action_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['type_id', 'action_id']); // voorkomt dubbele entries
        });
    }

    public function down(): void {
        Schema::dropIfExists('device_type_action');
    }
};
