<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminActivityController;
use App\Http\Controllers\AdminCampaignController;
use App\Http\Controllers\AdminConversionController;
use App\Http\Controllers\AdminBrandController;
use App\Http\Controllers\AdminImportController;
use App\Http\Controllers\AdminPayoutRequestController;
use App\Http\Controllers\AdminRewardController;
use App\Http\Controllers\AdminSupportTicketController;
use App\Http\Controllers\AdminWaitlistController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessBillingController;
use App\Http\Controllers\BusinessCampaignController;
use App\Http\Controllers\BusinessDashboardController;
use App\Http\Controllers\BusinessPayoutRequestController;
use App\Http\Controllers\BusinessProfileController;
use App\Http\Controllers\BusinessSupportTicketController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\PayoutRequestController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ParticipantProfileController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ReferralLinkController;
use App\Http\Controllers\SimulateConversionController;
use App\Http\Controllers\WaitlistSubmissionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    $user = $request->user();

    if ($user?->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    if ($user?->isBusinessOwner()) {
        return redirect()->route(
            $user->hasCompleteBusinessProfile() ? 'business.dashboard' : 'business.profile.edit',
        );
    }

    if ($user) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Landing/Index');
});

Route::get('/terms-of-use', function () {
    return Inertia::render('Legal/TermsOfUse');
})->name('legal.terms');

Route::get('/terms', function () {
    return Inertia::render('Legal/TermsOfUse');
})->name('legal.terms.short');

Route::get('/privacy-policy', function () {
    return Inertia::render('Legal/PrivacyPolicy');
})->name('legal.privacy');

Route::get('/privacy', function () {
    return Inertia::render('Legal/PrivacyPolicy');
})->name('legal.privacy.short');

Route::get('/register/success', [RegisterController::class, 'success'])->name('register.success');
Route::post('/waitlist', [WaitlistSubmissionController::class, 'store'])->name('waitlist.store');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
    Route::get('/forgot-password', [PasswordResetController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'edit'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'update'])->name('password.update');
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::get('/register/business', [RegisterController::class, 'createBusiness'])->name('register.business');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::get('/verify', [EmailVerificationController::class, 'create'])->name('verify.notice');
    Route::post('/verify', [EmailVerificationController::class, 'store'])->name('verify.store');
    Route::post('/verify/resend', [EmailVerificationController::class, 'resend'])->name('verify.resend');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/stats-summary', [DashboardController::class, 'statsSummary'])->name('dashboard.stats-summary');
    Route::get('/profile', [ParticipantProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ParticipantProfileController::class, 'update'])->name('profile.update');
    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/{campaign}/stats-summary', [CampaignController::class, 'statsSummary'])->name('campaigns.stats-summary');
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show'])->name('campaigns.show');
    Route::post('/campaigns/{campaign}/referral-link', [ReferralLinkController::class, 'store'])
        ->name('campaigns.referral-link.store');
    Route::get('/payouts', [PayoutRequestController::class, 'index'])->name('payouts.index');
    Route::post('/payouts/setup-intent', [PayoutRequestController::class, 'setupIntent'])->name('payouts.setup-intent');
    Route::post('/payouts/payment-method', [PayoutRequestController::class, 'savePaymentMethod'])->name('payouts.payment-method');
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
        Route::match(['post', 'put', 'patch'], '/brands/{brand}', [AdminBrandController::class, 'update'])->name('brands.update');
        Route::delete('/brands/{brand}', [AdminBrandController::class, 'destroy'])->name('brands.destroy');
        Route::get('/imports', [AdminImportController::class, 'index'])->name('imports.index');
        Route::post('/imports', [AdminImportController::class, 'store'])->name('imports.store');
        Route::get('/imports/template', [AdminImportController::class, 'template'])->name('imports.template');
        Route::get('/imports/export/brands', [AdminImportController::class, 'exportBrands'])->name('imports.export.brands');
        Route::get('/imports/export/campaigns', [AdminImportController::class, 'exportCampaigns'])->name('imports.export.campaigns');
        Route::get('/imports/export/all', [AdminImportController::class, 'exportAll'])->name('imports.export.all');
        Route::get('/waitlist', [AdminWaitlistController::class, 'index'])->name('waitlist.index');
        Route::get('/campaigns', [AdminCampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create', [AdminCampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns', [AdminCampaignController::class, 'store'])->name('campaigns.store');
        Route::get('/campaigns/{campaign}/edit', [AdminCampaignController::class, 'edit'])->name('campaigns.edit');
        Route::match(['post', 'put'], '/campaigns/{campaign}', [AdminCampaignController::class, 'update'])->name('campaigns.update');
        Route::post('/campaigns/{campaign}/simulate-conversion', [SimulateConversionController::class, 'admin'])->name('campaigns.simulate-conversion');
        Route::get('/conversions/create', [AdminConversionController::class, 'create'])->name('conversions.create');
        Route::post('/conversions', [AdminConversionController::class, 'store'])->name('conversions.store');
        Route::get('/rewards', [AdminRewardController::class, 'index'])->name('rewards.index');
        Route::patch('/rewards/{reward}/paid', [AdminRewardController::class, 'markPaid'])->name('rewards.mark-paid');
        Route::get('/payout-requests', [AdminPayoutRequestController::class, 'index'])->name('payout-requests.index');
        Route::get('/support-tickets', [AdminSupportTicketController::class, 'index'])->name('support-tickets.index');
        Route::get('/support-tickets/{supportTicket}', [AdminSupportTicketController::class, 'show'])->name('support-tickets.show');
        Route::post('/support-tickets/{supportTicket}/reply', [AdminSupportTicketController::class, 'reply'])->name('support-tickets.reply');
        Route::patch('/support-tickets/{supportTicket}/status', [AdminSupportTicketController::class, 'updateStatus'])->name('support-tickets.status.update');
        Route::get('/activity', [AdminActivityController::class, 'index'])->name('activity.index');
    });

Route::middleware(['auth', 'business_owner'])
    ->prefix('business')
    ->name('business.')
    ->group(function () {
        Route::get('/dashboard', BusinessDashboardController::class)->name('dashboard');
        Route::get('/profile', [BusinessProfileController::class, 'edit'])->name('profile.edit');
        Route::post('/profile', [BusinessProfileController::class, 'update'])->name('profile.update');
        Route::get('/billing', [BusinessBillingController::class, 'edit'])->name('billing.edit');
        Route::post('/billing/setup-intent', [BusinessBillingController::class, 'setupIntent'])->name('billing.setup-intent');
        Route::post('/billing/payment-method', [BusinessBillingController::class, 'savePaymentMethod'])->name('billing.payment-method');
        Route::get('/payout-requests', [BusinessPayoutRequestController::class, 'index'])->name('payout-requests.index');
        Route::post('/payout-requests/{payoutRequest}/approve', [BusinessPayoutRequestController::class, 'approve'])->name('payout-requests.approve');
        Route::get('/support-tickets', [BusinessSupportTicketController::class, 'index'])->name('support-tickets.index');
        Route::get('/support-tickets/create', [BusinessSupportTicketController::class, 'create'])->name('support-tickets.create');
        Route::post('/support-tickets', [BusinessSupportTicketController::class, 'store'])->name('support-tickets.store');
        Route::get('/support-tickets/{supportTicket}', [BusinessSupportTicketController::class, 'show'])->name('support-tickets.show');
        Route::post('/support-tickets/{supportTicket}/reply', [BusinessSupportTicketController::class, 'reply'])->name('support-tickets.reply');
        Route::patch('/support-tickets/{supportTicket}/resolve', [BusinessSupportTicketController::class, 'resolve'])->name('support-tickets.resolve');
        Route::patch('/support-tickets/{supportTicket}/reopen', [BusinessSupportTicketController::class, 'reopen'])->name('support-tickets.reopen');
        Route::get('/campaigns', [BusinessCampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create', [BusinessCampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns', [BusinessCampaignController::class, 'store'])->name('campaigns.store');
        Route::patch('/campaigns/{campaign}/status', [BusinessCampaignController::class, 'updateStatus'])->name('campaigns.status.update');
        Route::post('/campaigns/{campaign}/simulate-conversion', [SimulateConversionController::class, 'business'])->name('campaigns.simulate-conversion');
        Route::get('/campaigns/{campaign}/preview', [BusinessCampaignController::class, 'preview'])->name('campaigns.preview');
        Route::get('/campaigns/{campaign}/stats-summary', [BusinessCampaignController::class, 'statsSummary'])->name('campaigns.stats-summary');
        Route::get('/campaigns/{campaign}', [BusinessCampaignController::class, 'show'])->name('campaigns.show');
        Route::get('/campaigns/{campaign}/edit', [BusinessCampaignController::class, 'edit'])->name('campaigns.edit');
        Route::match(['post', 'put'], '/campaigns/{campaign}', [BusinessCampaignController::class, 'update'])->name('campaigns.update');
        Route::get('/campaigns/{campaign}/stats', [BusinessCampaignController::class, 'stats'])->name('campaigns.stats');
    });

Route::get('/r/{token}', [ReferralLinkController::class, 'show'])->name('referrals.show');
