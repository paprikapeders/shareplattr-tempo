<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('domain')->nullable()->after('website_url');
            $table->string('affiliate_url', 2048)->nullable()->after('domain');
            $table->string('logo_url', 2048)->nullable()->after('logo');
            $table->string('country_region')->nullable()->after('business_type');
            $table->string('contact_info')->nullable()->after('country_region');
            $table->text('notes')->nullable()->after('contact_info');
            $table->json('import_metadata')->nullable()->after('notes');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->text('commission_details')->nullable()->after('reward_amount');
            $table->string('cookie_duration')->nullable()->after('commission_details');
            $table->string('network_platform')->nullable()->after('cookie_duration');
            $table->text('payout_details')->nullable()->after('network_platform');
            $table->text('requirements')->nullable()->after('payout_details');
            $table->text('deliverables')->nullable()->after('requirements');
            $table->json('tags')->nullable()->after('deliverables');
            $table->json('assets')->nullable()->after('tags');
            $table->text('participant_instructions')->nullable()->after('assets');
            $table->json('import_metadata')->nullable()->after('participant_instructions');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn([
                'commission_details',
                'cookie_duration',
                'network_platform',
                'payout_details',
                'requirements',
                'deliverables',
                'tags',
                'assets',
                'participant_instructions',
                'import_metadata',
            ]);
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn([
                'domain',
                'affiliate_url',
                'logo_url',
                'country_region',
                'contact_info',
                'notes',
                'import_metadata',
            ]);
        });
    }
};
