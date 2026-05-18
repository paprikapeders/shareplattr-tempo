<?php

namespace App\Models;

use App\Support\ImportKey;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable([
    'created_by',
    'business_owner_id',
    'brand_id',
    'brand_name',
    'title',
    'normalized_title',
    'slug',
    'description',
    'category',
    'category_key',
    'category_other',
    'reward_type',
    'reward_amount',
    'commission_details',
    'cookie_duration',
    'network_platform',
    'payout_details',
    'requirements',
    'deliverables',
    'tags',
    'assets',
    'participant_instructions',
    'share_message_template',
    'import_metadata',
    'destination_url',
    'campaign_banner',
    'status',
    'expires_at',
])]
class Campaign extends Model
{
    /** @use HasFactory */
    use HasFactory;

    protected static function booted(): void
    {
        static::saving(function (Campaign $campaign) {
            if ($campaign->isDirty('title') || blank($campaign->slug)) {
                $campaign->slug = static::uniqueSlug($campaign->title, $campaign->id);
            }

            if ($campaign->isDirty('title') || blank($campaign->normalized_title)) {
                $campaign->normalized_title = ImportKey::normalize($campaign->title);
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'tags' => 'array',
            'assets' => 'array',
            'import_metadata' => 'array',
        ];
    }

    /**
     * Get the admin that created this campaign.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function businessOwner()
    {
        return $this->belongsTo(User::class, 'business_owner_id');
    }

    /**
     * Get the brand for this campaign.
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Scope campaigns that participants can currently use.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query
            ->where('status', 'active')
            ->where(function (Builder $query) {
                $query
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Get the referral tokens for this campaign.
     */
    public function referralTokens()
    {
        return $this->hasMany(ReferralToken::class);
    }

    /**
     * Get the clicks for this campaign.
     */
    public function clicks()
    {
        return $this->hasMany(Click::class);
    }

    /**
     * Get the conversions for this campaign.
     */
    public function conversions()
    {
        return $this->hasMany(Conversion::class);
    }

    /**
     * Get the rewards for this campaign.
     */
    public function rewards()
    {
        return $this->hasMany(Reward::class);
    }

    public static function uniqueSlug(?string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title ?? '') ?: 'campaign';
        $slug = $base;
        $suffix = 2;

        while (
            static::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn (Builder $query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
