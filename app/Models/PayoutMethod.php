<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'type', 'paypal_email', 'verified_at'])]
class PayoutMethod extends Model
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
            'paypal_email' => 'encrypted',
            'verified_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this payout method.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
