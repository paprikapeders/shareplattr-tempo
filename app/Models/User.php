<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'is_admin', 'user_type', 'welcome_email_sent_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'welcome_email_sent_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Get the referral tokens for this user.
     */
    public function referralTokens()
    {
        return $this->hasMany(ReferralToken::class);
    }

    /**
     * Get the clicks for this user.
     */
    public function clicks()
    {
        return $this->hasMany(Click::class);
    }

    /**
     * Get the conversions for this user.
     */
    public function conversions()
    {
        return $this->hasMany(Conversion::class);
    }

    /**
     * Get the rewards for this user.
     */
    public function rewards()
    {
        return $this->hasMany(Reward::class);
    }

    /**
     * Get the user's payout method.
     */
    public function payoutMethod()
    {
        return $this->hasOne(PayoutMethod::class);
    }

    /**
     * Get the payout requests for this user.
     */
    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class);
    }

    /**
     * Get the email verification codes for this user.
     */
    public function emailVerificationCodes()
    {
        return $this->hasMany(EmailVerificationCode::class);
    }

    public function businessProfile()
    {
        return $this->hasOne(BusinessProfile::class);
    }

    public function ownedCampaigns()
    {
        return $this->hasMany(Campaign::class, 'business_owner_id');
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin || $this->user_type === 'admin';
    }

    public function isBusinessOwner(): bool
    {
        return ! $this->isAdmin() && $this->user_type === 'business_owner';
    }

    public function isParticipant(): bool
    {
        return ! $this->isAdmin() && $this->user_type === 'participant';
    }

    public function hasCompleteBusinessProfile(): bool
    {
        return $this->businessProfile
            && filled($this->businessProfile->company_name)
            && filled($this->businessProfile->contact_person_name);
    }
}
