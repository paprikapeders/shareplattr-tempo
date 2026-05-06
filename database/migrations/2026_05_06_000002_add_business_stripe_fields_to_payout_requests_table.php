<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payout_requests', function (Blueprint $table) {
            $table->timestamp('business_approved_at')->nullable()->after('paid_at');
            $table->foreignId('business_approved_by')->nullable()->after('business_approved_at')->constrained('users')->nullOnDelete();
            $table->string('stripe_payment_intent_id')->nullable()->after('business_approved_by');
            $table->string('stripe_payment_status')->nullable()->after('stripe_payment_intent_id');
            $table->text('stripe_failure_reason')->nullable()->after('stripe_payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('payout_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('business_approved_by');
            $table->dropColumn([
                'business_approved_at',
                'stripe_payment_intent_id',
                'stripe_payment_status',
                'stripe_failure_reason',
            ]);
        });
    }
};
