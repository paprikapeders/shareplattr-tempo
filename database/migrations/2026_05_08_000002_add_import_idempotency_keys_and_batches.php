<?php

use App\Support\ImportKey;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('normalized_name')->nullable()->after('name');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('normalized_title')->nullable()->after('title');
        });

        DB::table('brands')
            ->orderBy('id')
            ->get(['id', 'name'])
            ->each(fn ($brand) => DB::table('brands')
                ->where('id', $brand->id)
                ->update(['normalized_name' => ImportKey::normalize($brand->name)]));

        DB::table('campaigns')
            ->orderBy('id')
            ->get(['id', 'title'])
            ->each(fn ($campaign) => DB::table('campaigns')
                ->where('id', $campaign->id)
                ->update(['normalized_title' => ImportKey::normalize($campaign->title)]));

        Schema::table('brands', function (Blueprint $table) {
            $table->unique('normalized_name', 'brands_normalized_name_unique');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->unique(['brand_id', 'normalized_title'], 'campaigns_brand_normalized_title_unique');
        });

        Schema::create('import_batches', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('file_hash', 64)->index();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('import_batch_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_batch_id')->constrained('import_batches')->cascadeOnDelete();
            $table->unsignedInteger('row_number');
            $table->string('row_hash', 64)->index();
            $table->string('status');
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_batch_rows');
        Schema::dropIfExists('import_batches');

        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropUnique('campaigns_brand_normalized_title_unique');
            $table->dropColumn('normalized_title');
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->dropUnique('brands_normalized_name_unique');
            $table->dropColumn('normalized_name');
        });
    }
};
