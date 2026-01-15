<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boat_orders', function (Blueprint $table) {
            $table->id('id_order');
            $table->unsignedBigInteger('boat_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('status', 50)->default('ожидание');
            $table->boolean('available')->default(true);
            $table->string('available_days')->default('Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье');
            $table->time('available_time_start')->default('09:00:00');
            $table->time('available_time_end')->default('18:00:00');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->decimal('price_discount', 10, 2)->nullable();
            $table->timestamps();

            $table->index('boat_id');
            $table->index('product_id');
            $table->index('status');
            $table->foreign('boat_id')->references('id_boat')->on('boats')->onDelete('cascade');
            $table->foreign('product_id')->references('id_product')->on('products')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boat_orders');
    }
};
