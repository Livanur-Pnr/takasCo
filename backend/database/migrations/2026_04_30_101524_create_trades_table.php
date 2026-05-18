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
        Schema::create('trades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users'); // Teklifi yapan[cite: 2]
            $table->foreignId('receiver_id')->constrained('users'); // İlanın sahibi[cite: 2]
            $table->foreignId('offered_product_id')->constrained('products'); // Verilen ürün[cite: 2]
            $table->foreignId('requested_product_id')->constrained('products'); // İstenen ürün[cite: 2]
            $table->string('status')->default('beklemede'); // beklemede, onaylandı, reddedildi[cite: 2]
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};
