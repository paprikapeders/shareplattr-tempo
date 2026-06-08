<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'ticket_number',
    'business_user_id',
    'subject',
    'category',
    'priority',
    'status',
    'resolved_at',
])]
class SupportTicket extends Model
{
    /** @use HasFactory */
    use HasFactory;

    public const CATEGORIES = [
        'campaign_issue' => 'Campaign issue',
        'payout_issue' => 'Payout issue',
        'billing_issue' => 'Billing issue',
        'referral_click_issue' => 'Referral/click issue',
        'account_issue' => 'Account issue',
        'other' => 'Other',
    ];

    public const PRIORITIES = [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
        'urgent' => 'Urgent',
    ];

    public const STATUSES = [
        'open' => 'Open',
        'pending' => 'Pending',
        'ongoing' => 'Ongoing',
        'resolved' => 'Resolved',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function businessUser()
    {
        return $this->belongsTo(User::class, 'business_user_id');
    }

    public function messages()
    {
        return $this->hasMany(SupportTicketMessage::class);
    }

    public function attachments()
    {
        return $this->hasMany(SupportTicketAttachment::class);
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }
}
