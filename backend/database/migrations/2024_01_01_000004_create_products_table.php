<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('id_product');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category', 100)->default('Другое');
            $table->string('image_url', 500)->nullable();
            $table->boolean('available')->default(true);
            $table->integer('quantity')->default(0);
            $table->decimal('price', 10, 2);
            $table->decimal('price_discount', 10, 2)->nullable();
            $table->timestamps();

            $table->index('available');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
