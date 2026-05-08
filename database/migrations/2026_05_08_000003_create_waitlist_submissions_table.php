<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlist_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('type');
            $table->string('ip_address')->nullable();
            $table->string('source_page')->nullable();
            $table->timestamps();

            $table->unique(['email', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist_submissions');
    }
};
