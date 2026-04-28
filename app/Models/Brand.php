<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'logo', 'description', 'business_type', 'website_url', 'status'])]
class Brand extends Model
{
    /** @use HasFactory */
    use HasFactory;

    /**
     * Get the campaigns for this brand.
     */
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }
}
