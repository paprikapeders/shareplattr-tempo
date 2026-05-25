<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'referral_token_id',
    'campaign_id',
    'user_id',
    'ip_address',
    'user_agent',
    'source',
    'country',
    'country_code',
    'region',
    'city',
    'is_flagged',
    'flag_reason',
])]
class Click extends Model
{
    /** @use HasFactory */
    use HasFactory;

    protected $casts = [
        'is_flagged' => 'boolean',
    ];

    /**
     * Get the referral token for this click.
     */
    public function referralToken()
    {
        return $this->belongsTo(ReferralToken::class);
    }

    /**
     * Get the campaign for this click.
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Get the referral owner for this click, not the visitor who clicked.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
