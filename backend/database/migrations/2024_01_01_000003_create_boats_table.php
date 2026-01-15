<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boats', function (Blueprint $table) {
            $table->id('id_boat');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->boolean('available')->default(true);
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->decimal('price_discount', 10, 2)->nullable();
            $table->string('available_days')->default('Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье');
            $table->time('available_time_start')->default('09:00:00');
            $table->time('available_time_end')->default('18:00:00');
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->timestamps();

            $table->index('available');
            $table->index('owner_id');
            $table->foreign('owner_id')->references('id_owner')->on('owners')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boats');
    }
};
