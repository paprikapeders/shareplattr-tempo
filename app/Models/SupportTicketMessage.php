<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'support_ticket_id',
    'sender_id',
    'sender_type',
    'message',
])]
class SupportTicketMessage extends Model
{
    /** @use HasFactory */
    use HasFactory;

    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachments()
    {
        return $this->hasMany(SupportTicketAttachment::class);
    }
}
