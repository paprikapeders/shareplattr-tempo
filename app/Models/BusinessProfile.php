<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'brand_id',
    'company_name',
    'contact_person_name',
    'website_url',
    'phone',
    'industry',
    'description',
    'logo_path',
    'status',
    'stripe_customer_id',
    'stripe_payment_method_id',
    'stripe_card_brand',
    'stripe_card_last4',
    'stripe_card_exp_month',
    'stripe_card_exp_year',
    'stripe_billing_ready',
])]
class BusinessProfile extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'stripe_billing_ready' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
}
