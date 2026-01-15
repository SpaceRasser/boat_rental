<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id('id_booking');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('owner_id');
            $table->time('start_time');
            $table->time('end_time');
            $table->date('booking_date');
            $table->string('status', 50)->default('бронь');
            $table->timestamps();

            $table->index('user_id');
            $table->index('owner_id');
            $table->index('booking_date');
            $table->index('status');
            $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('owner_id')->references('id_owner')->on('owners')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
