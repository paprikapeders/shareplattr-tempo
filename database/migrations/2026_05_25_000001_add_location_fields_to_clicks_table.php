<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clicks', function (Blueprint $table) {
            $table->string('country')->nullable()->after('source');
            $table->string('country_code', 2)->nullable()->after('country');
            $table->string('region')->nullable()->after('country_code');
            $table->string('city')->nullable()->after('region');
            $table->index(['campaign_id', 'country', 'region']);
        });
    }

    public function down(): void
    {
        Schema::table('clicks', function (Blueprint $table) {
            $table->dropIndex(['campaign_id', 'country', 'region']);
            $table->dropColumn(['country', 'country_code', 'region', 'city']);
        });
    }
};
