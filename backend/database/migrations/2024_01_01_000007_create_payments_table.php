<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('id_payment');
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 50)->default('card');
            $table->string('status', 50)->default('pending');
            $table->string('transaction_id')->nullable();
            $table->date('payment_date');
            $table->timestamps();

            $table->index('booking_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('payment_date');
            $table->foreign('booking_id')->references('id_booking')->on('bookings')->onDelete('set null');
            $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
