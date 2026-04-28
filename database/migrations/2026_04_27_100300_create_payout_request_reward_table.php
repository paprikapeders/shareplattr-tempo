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
        Schema::create('payout_request_reward', function (Blueprint $table) {
            $table->foreignId('payout_request_id')->constrained('payout_requests')->cascadeOnDelete();
            $table->foreignId('reward_id')->constrained('rewards')->cascadeOnDelete();

            $table->primary(['payout_request_id', 'reward_id']);
            $table->unique('reward_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payout_request_reward');
    }
};
