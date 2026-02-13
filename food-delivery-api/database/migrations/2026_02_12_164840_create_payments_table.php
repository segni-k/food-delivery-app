<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\PaymentStatusEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('order_id')->constrained();
            $table->string('gateway')->default('chapa');
            $table->string('gateway_transaction_ref')->nullable()->unique();
            $table->string('gateway_reference')->nullable()->index();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('ETB');
            $table->string('status')->default(PaymentStatusEnum::PENDING->value)->index();
            $table->json('gateway_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
