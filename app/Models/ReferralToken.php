<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'campaign_id', 'token'])]
class ReferralToken extends Model
{
    /** @use HasFactory */
    use HasFactory;

    /**
     * Get the user that owns this token.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the campaign this token is for.
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Get the clicks for this token.
     */
    public function clicks()
    {
        return $this->hasMany(Click::class);
    }

    /**
     * Get the conversions for this token.
     */
    public function conversions()
    {
        return $this->hasMany(Conversion::class);
    }
}