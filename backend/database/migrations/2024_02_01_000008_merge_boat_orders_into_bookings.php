<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('boat_id')->nullable()->after('owner_id');
            $table->unsignedBigInteger('product_id')->nullable()->after('boat_id');
            $table->integer('quantity')->default(1)->after('product_id');
            $table->decimal('price', 10, 2)->nullable()->after('quantity');
            $table->decimal('price_discount', 10, 2)->nullable()->after('price');
            $table->string('available_days')->nullable()->after('price_discount');
            $table->time('available_time_start')->nullable()->after('available_days');
            $table->time('available_time_end')->nullable()->after('available_time_start');

            $table->index('boat_id');
            $table->index('product_id');
            $table->foreign('boat_id')->references('id_boat')->on('boats')->onDelete('set null');
            $table->foreign('product_id')->references('id_product')->on('products')->onDelete('set null');
        });

        Schema::dropIfExists('boat_orders');
    }

    public function down(): void
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

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['boat_id']);
            $table->dropForeign(['product_id']);
            $table->dropIndex(['boat_id']);
            $table->dropIndex(['product_id']);
            $table->dropColumn([
                'boat_id',
                'product_id',
                'quantity',
                'price',
                'price_discount',
                'available_days',
                'available_time_start',
                'available_time_end',
            ]);
        });
    }
};
