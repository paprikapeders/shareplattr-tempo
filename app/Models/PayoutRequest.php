<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'payout_method_id',
    'amount',
    'status',
    'requested_at',
    'processed_at',
    'paid_at',
    'business_approved_at',
    'business_approved_by',
    'stripe_payment_intent_id',
    'stripe_payment_status',
    'stripe_failure_reason',
    'payout_reference',
    'admin_notes',
    'rejection_reason',
])]
class PayoutRequest extends Model
{
    /** @use HasFactory */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'processed_at' => 'datetime',
            'paid_at' => 'datetime',
            'business_approved_at' => 'datetime',
        ];
    }

    /**
     * Get the user that created the payout request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payout method used for this request.
     */
    public function payoutMethod()
    {
        return $this->belongsTo(PayoutMethod::class);
    }

    /**
     * Get the rewards included in this payout request.
     */
    public function rewards()
    {
        return $this->belongsToMany(Reward::class, 'payout_request_reward');
    }

    public function businessApprover()
    {
        return $this->belongsTo(User::class, 'business_approved_by');
    }
}
