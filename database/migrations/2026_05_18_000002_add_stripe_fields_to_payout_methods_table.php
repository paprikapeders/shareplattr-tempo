<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payout_methods', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('verified_at');
            $table->string('stripe_payment_method_id')->nullable()->after('stripe_customer_id');
            $table->string('stripe_card_brand')->nullable()->after('stripe_payment_method_id');
            $table->string('stripe_card_last4')->nullable()->after('stripe_card_brand');
            $table->unsignedTinyInteger('stripe_card_exp_month')->nullable()->after('stripe_card_last4');
            $table->unsignedSmallInteger('stripe_card_exp_year')->nullable()->after('stripe_card_exp_month');
        });
    }

    public function down(): void
    {
        Schema::table('payout_methods', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id',
                'stripe_payment_method_id',
                'stripe_card_brand',
                'stripe_card_last4',
                'stripe_card_exp_month',
                'stripe_card_exp_year',
            ]);
        });
    }
};
