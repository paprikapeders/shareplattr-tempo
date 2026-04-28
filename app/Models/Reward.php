<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['conversion_id', 'user_id', 'campaign_id', 'amount', 'status', 'paid_at', 'payout_reference'])]
class Reward extends Model
{
    /** @use HasFactory */
    use HasFactory;

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    /**
     * Get the conversion that created this reward.
     */
    public function conversion()
    {
        return $this->belongsTo(Conversion::class);
    }

    /**
     * Get the user for this reward.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the campaign for this reward.
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Get payout requests that include this reward.
     */
    public function payoutRequests()
    {
        return $this->belongsToMany(PayoutRequest::class, 'payout_request_reward');
    }
}
