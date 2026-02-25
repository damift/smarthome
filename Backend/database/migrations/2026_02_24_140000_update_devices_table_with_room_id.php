<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Add room_id column
            $table->unsignedBigInteger('room_id')->nullable()->after('name');
            // Add foreign key
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            // Drop old room column
            $table->dropColumn('room');
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropColumn('room_id');
            $table->string('room')->after('name');
        });
    }
};
