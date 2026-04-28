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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('brand_name');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->integer('reward_amount'); // in cents
            $table->string('destination_url');
            $table->string('status')->default('active');
            $table->integer('click_count')->default(0);
            $table->integer('conversion_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};