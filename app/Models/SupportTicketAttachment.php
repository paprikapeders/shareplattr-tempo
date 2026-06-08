<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'support_ticket_id',
    'support_ticket_message_id',
    'uploaded_by_user_id',
    'file_path',
    'original_name',
    'mime_type',
    'size',
])]
class SupportTicketAttachment extends Model
{
    /** @use HasFactory */
    use HasFactory;

    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    public function message()
    {
        return $this->belongsTo(SupportTicketMessage::class, 'support_ticket_message_id');
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }
}
