<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['type', 'referral_token_id', 'user_id', 'ip_address', 'user_agent', 'reason'])]
class BlockedActivity extends Model
{
    /** @use HasFactory */
    use HasFactory;

    /**
     * Get the referral token related to this activity.
     */
    public function referralToken()
    {
        return $this->belongsTo(ReferralToken::class);
    }

    /**
     * Get the participant related to this activity.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
