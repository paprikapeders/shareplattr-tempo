<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['campaign_id', 'user_id', 'referral_token_id', 'amount', 'status', 'notes', 'verified_at', 'rejected_reason'])]
class Conversion extends Model
{
    /** @use HasFactory */
    use HasFactory;

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    /**
     * Get the campaign for this conversion.
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Get the user for this conversion.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the referral token for this conversion.
     */
    public function referralToken()
    {
        return $this->belongsTo(ReferralToken::class);
    }

    /**
     * Get the reward for this conversion.
     */
    public function reward()
    {
        return $this->hasOne(Reward::class);
    }
}