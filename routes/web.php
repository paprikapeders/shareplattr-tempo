<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminActivityController;
use App\Http\Controllers\AdminCampaignController;
use App\Http\Controllers\AdminConversionController;
use App\Http\Controllers\AdminBrandController;
use App\Http\Controllers\AdminPayoutRequestController;
use App\Http\Controllers\AdminRewardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessCampaignController;
use App\Http\Controllers\BusinessDashboardController;
use App\Http\Controllers\BusinessProfileController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\PayoutMethodController;
use App\Http\Controllers\PayoutRequestController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ReferralLinkController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::get('/verify', [EmailVerificationController::class, 'create'])->name('verify.notice');
    Route::post('/verify', [EmailVerificationController::class, 'store'])->name('verify.store');
    Route::post('/verify/resend', [EmailVerificationController::class, 'resend'])->name('verify.resend');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show'])->name('campaigns.show');
    Route::post('/campaigns/{campaign}/referral-link', [ReferralLinkController::class, 'store'])
        ->name('campaigns.referral-link.store');
    Route::put('/payout-method', [PayoutMethodController::class, 'update'])->name('payout-method.update');
    Route::get('/payouts', [PayoutRequestController::class, 'index'])->name('payouts.index');
    Route::post('/payout-requests', [PayoutRequestController::class, 'store'])->name('payout-requests.store');
});

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('dashboard');
        Route::get('/brands', [AdminBrandController::class, 'index'])->name('brands.index');
        Route::get('/brands/create', [AdminBrandController::class, 'create'])->name('brands.create');
        Route::post('/brands', [AdminBrandController::class, 'store'])->name('brands.store');
        Route::get('/brands/{brand}', [AdminBrandController::class, 'show'])->name('brands.show');
        Route::get('/brands/{brand}/edit', [AdminBrandController::class, 'edit'])->name('brands.edit');
        Route::post('/brands/{brand}', [AdminBrandController::class, 'update'])->name('brands.update');
        Route::delete('/brands/{brand}', [AdminBrandController::class, 'destroy'])->name('brands.destroy');
        Route::get('/campaigns', [AdminCampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create', [AdminCampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns', [AdminCampaignController::class, 'store'])->name('campaigns.store');
        Route::get('/campaigns/{campaign}/edit', [AdminCampaignController::class, 'edit'])->name('campaigns.edit');
        Route::match(['post', 'put'], '/campaigns/{campaign}', [AdminCampaignController::class, 'update'])->name('campaigns.update');
        Route::get('/conversions/create', [AdminConversionController::class, 'create'])->name('conversions.create');
        Route::post('/conversions', [AdminConversionController::class, 'store'])->name('conversions.store');
        Route::get('/rewards', [AdminRewardController::class, 'index'])->name('rewards.index');
        Route::patch('/rewards/{reward}/paid', [AdminRewardController::class, 'markPaid'])->name('rewards.mark-paid');
        Route::get('/payout-requests', [AdminPayoutRequestController::class, 'index'])->name('payout-requests.index');
        Route::patch('/payout-requests/{payoutRequest}/processing', [AdminPayoutRequestController::class, 'markProcessing'])->name('payout-requests.processing');
        Route::patch('/payout-requests/{payoutRequest}/paid', [AdminPayoutRequestController::class, 'markPaid'])->name('payout-requests.paid');
        Route::patch('/payout-requests/{payoutRequest}/rejected', [AdminPayoutRequestController::class, 'reject'])->name('payout-requests.rejected');
        Route::get('/activity', [AdminActivityController::class, 'index'])->name('activity.index');
    });

Route::middleware(['auth', 'business_owner'])
    ->prefix('business')
    ->name('business.')
    ->group(function () {
        Route::get('/dashboard', BusinessDashboardController::class)->name('dashboard');
        Route::get('/profile', [BusinessProfileController::class, 'edit'])->name('profile.edit');
        Route::post('/profile', [BusinessProfileController::class, 'update'])->name('profile.update');
        Route::get('/campaigns', [BusinessCampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create', [BusinessCampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns', [BusinessCampaignController::class, 'store'])->name('campaigns.store');
        Route::patch('/campaigns/{campaign}/status', [BusinessCampaignController::class, 'updateStatus'])->name('campaigns.status.update');
        Route::get('/campaigns/{campaign}', [BusinessCampaignController::class, 'show'])->name('campaigns.show');
        Route::get('/campaigns/{campaign}/edit', [BusinessCampaignController::class, 'edit'])->name('campaigns.edit');
        Route::match(['post', 'put'], '/campaigns/{campaign}', [BusinessCampaignController::class, 'update'])->name('campaigns.update');
        Route::get('/campaigns/{campaign}/stats', [BusinessCampaignController::class, 'stats'])->name('campaigns.stats');
    });

Route::get('/r/{token}', [ReferralLinkController::class, 'show'])->name('referrals.show');
