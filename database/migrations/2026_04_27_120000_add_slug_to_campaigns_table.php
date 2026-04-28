<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('title');
        });

        $usedSlugs = [];

        DB::table('campaigns')
            ->select(['id', 'title'])
            ->orderBy('id')
            ->each(function (object $campaign) use (&$usedSlugs) {
                $base = Str::slug($campaign->title) ?: 'campaign-'.$campaign->id;
                $slug = $base;
                $suffix = 2;

                while (in_array($slug, $usedSlugs, true)) {
                    $slug = $base.'-'.$suffix;
                    $suffix++;
                }

                $usedSlugs[] = $slug;

                DB::table('campaigns')
                    ->where('id', $campaign->id)
                    ->update(['slug' => $slug]);
            });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
