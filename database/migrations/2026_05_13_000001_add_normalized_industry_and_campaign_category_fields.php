<?php

use App\Support\Taxonomy;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_profiles', function (Blueprint $table) {
            $table->string('industry_key')->nullable()->after('industry')->index('business_profiles_industry_key_index');
            $table->string('industry_other')->nullable()->after('industry_key');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('category_key')->nullable()->after('category')->index('campaigns_category_key_index');
            $table->string('category_other')->nullable()->after('category_key');
        });

        Schema::create('taxonomy_mapping_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type');
            $table->unsignedBigInteger('record_id');
            $table->string('field');
            $table->string('original_value')->nullable();
            $table->string('mapped_value')->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'field']);
        });

        DB::table('business_profiles')
            ->select(['id', 'industry'])
            ->orderBy('id')
            ->get()
            ->each(function ($profile) {
                [$key, $other, $needsReview] = Taxonomy::industryFromValue($profile->industry);

                DB::table('business_profiles')
                    ->where('id', $profile->id)
                    ->update([
                        'industry_key' => $key,
                        'industry_other' => $other,
                    ]);

                if ($needsReview) {
                    $this->insertReview('business_profile', $profile->id, 'industry', $profile->industry, $key);
                }
            });

        DB::table('campaigns')
            ->select(['id', 'category'])
            ->orderBy('id')
            ->get()
            ->each(function ($campaign) {
                [$key, $other, $needsReview] = Taxonomy::campaignCategoryFromValue($campaign->category);

                DB::table('campaigns')
                    ->where('id', $campaign->id)
                    ->update([
                        'category_key' => $key,
                        'category_other' => $other,
                    ]);

                if ($needsReview) {
                    $this->insertReview('campaign', $campaign->id, 'category', $campaign->category, $key);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('taxonomy_mapping_reviews');

        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropIndex('campaigns_category_key_index');
            $table->dropColumn(['category_key', 'category_other']);
        });

        Schema::table('business_profiles', function (Blueprint $table) {
            $table->dropIndex('business_profiles_industry_key_index');
            $table->dropColumn(['industry_key', 'industry_other']);
        });
    }

    private function insertReview(string $entityType, int $recordId, string $field, ?string $originalValue, ?string $mappedValue): void
    {
        DB::table('taxonomy_mapping_reviews')->insert([
            'entity_type' => $entityType,
            'record_id' => $recordId,
            'field' => $field,
            'original_value' => $originalValue,
            'mapped_value' => $mappedValue,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
