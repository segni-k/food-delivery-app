<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('order_id')->unique()->constrained();
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('restaurant_id')->constrained();
            $table->foreignId('delivery_partner_id')->nullable()->constrained('users');
            $table->unsignedTinyInteger('restaurant_rating');
            $table->unsignedTinyInteger('delivery_rating')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
