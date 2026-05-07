<?php

namespace App\Models;

use App\Support\ImportKey;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'normalized_name',
    'logo',
    'logo_url',
    'description',
    'business_type',
    'country_region',
    'website_url',
    'domain',
    'affiliate_url',
    'contact_info',
    'notes',
    'status',
    'import_metadata',
])]
class Brand extends Model
{
    /** @use HasFactory */
    use HasFactory;

    protected static function booted(): void
    {
        static::saving(function (Brand $brand) {
            if ($brand->isDirty('name') || blank($brand->normalized_name)) {
                $brand->normalized_name = ImportKey::normalize($brand->name);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'import_metadata' => 'array',
        ];
    }

    /**
     * Get the campaigns for this brand.
     */
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }
}
