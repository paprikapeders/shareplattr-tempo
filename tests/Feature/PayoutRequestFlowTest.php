<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Conversion;
use App\Models\PayoutMethod;
use App\Models\PayoutRequest;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayoutRequestFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_request_payout_for_all_pending_rewards_once(): void
    {
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();

        PayoutMethod::create([
            'user_id' => $participant->id,
            'type' => 'paypal',
            'paypal_email' => 'participant@example.com',
        ]);

        $firstReward = $this->createReward($participant, $campaign, 1200, 'pending');
        $secondReward = $this->createReward($participant, $campaign, 1800, 'pending');
        $this->createReward($participant, $campaign, 900, 'paid');

        $response = $this
            ->actingAs($participant)
            ->post(route('payout-requests.store'));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Payout request submitted.');

        $payoutRequest = PayoutRequest::firstOrFail();

        $this->assertSame($participant->id, $payoutRequest->user_id);
        $this->assertSame(3000, $payoutRequest->amount);
        $this->assertSame('pending', $payoutRequest->status);
        $this->assertNotNull($payoutRequest->requested_at);

        $this->assertDatabaseHas('payout_request_reward', [
            'payout_request_id' => $payoutRequest->id,
            'reward_id' => $firstReward->id,
        ]);

        $this->assertDatabaseHas('payout_request_reward', [
            'payout_request_id' => $payoutRequest->id,
            'reward_id' => $secondReward->id,
        ]);

        $this->assertDatabaseHas('rewards', [
            'id' => $firstReward->id,
            'status' => 'processing',
        ]);

        $this->assertDatabaseHas('rewards', [
            'id' => $secondReward->id,
            'status' => 'processing',
        ]);

        $this
            ->actingAs($participant)
            ->post(route('payout-requests.store'))
            ->assertRedirect()
            ->assertSessionHas('error', 'There are no pending rewards available for payout right now.');

        $this->assertDatabaseCount('payout_requests', 1);
    }

    public function test_admin_can_mark_payout_request_as_processing_and_paid(): void
    {
        $admin = User::factory()->admin()->create();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();
        $payoutMethod = PayoutMethod::create([
            'user_id' => $participant->id,
            'type' => 'paypal',
            'paypal_email' => 'participant@example.com',
        ]);

        $reward = $this->createReward($participant, $campaign, 2200, 'processing');
        $payoutRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'payout_method_id' => $payoutMethod->id,
            'amount' => 2200,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $payoutRequest->rewards()->attach($reward->id);

        $this
            ->actingAs($admin)
            ->patch(route('admin.payout-requests.processing', $payoutRequest), [
                'admin_notes' => 'Queued for manual PayPal transfer.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Payout request marked as processing.');

        $this
            ->actingAs($admin)
            ->patch(route('admin.payout-requests.paid', $payoutRequest), [
                'payout_reference' => 'PAYPAL-BATCH-100',
                'admin_notes' => 'Paid in today\'s batch.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Payout request marked as paid.');

        $payoutRequest->refresh();
        $reward->refresh();

        $this->assertSame('paid', $payoutRequest->status);
        $this->assertSame('PAYPAL-BATCH-100', $payoutRequest->payout_reference);
        $this->assertNotNull($payoutRequest->paid_at);
        $this->assertSame('paid', $reward->status);
        $this->assertSame('PAYPAL-BATCH-100', $reward->payout_reference);
        $this->assertNotNull($reward->paid_at);
    }

    public function test_admin_can_reject_payout_request_and_return_rewards_to_pending(): void
    {
        $admin = User::factory()->admin()->create();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();
        $payoutMethod = PayoutMethod::create([
            'user_id' => $participant->id,
            'type' => 'paypal',
            'paypal_email' => 'participant@example.com',
        ]);

        $reward = $this->createReward($participant, $campaign, 1900, 'processing');
        $payoutRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'payout_method_id' => $payoutMethod->id,
            'amount' => 1900,
            'status' => 'processing',
            'requested_at' => now(),
            'processed_at' => now(),
        ]);
        $payoutRequest->rewards()->attach($reward->id);

        $this
            ->actingAs($admin)
            ->patch(route('admin.payout-requests.rejected', $payoutRequest), [
                'rejection_reason' => 'PayPal details did not match the account owner.',
                'admin_notes' => 'Participant needs to update payout details.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Payout request rejected and rewards returned to pending.');

        $payoutRequest->refresh();
        $reward->refresh();

        $this->assertSame('rejected', $payoutRequest->status);
        $this->assertSame('PayPal details did not match the account owner.', $payoutRequest->rejection_reason);
        $this->assertSame('pending', $reward->status);
        $this->assertNull($reward->paid_at);
        $this->assertNull($reward->payout_reference);
    }

    private function createCampaign(): Campaign
    {
        return Campaign::create([
            'brand_name' => 'Northstar Coffee',
            'title' => 'Cold Brew Starter Pack',
            'description' => 'A simple campaign for testing payouts.',
            'category' => 'Food & Drink',
            'reward_amount' => 1200,
            'destination_url' => 'https://example.com/northstar-cold-brew',
            'status' => 'active',
        ]);
    }

    private function createReward(User $user, Campaign $campaign, int $amount, string $status): Reward
    {
        $conversion = Conversion::create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'amount' => $amount,
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        return Reward::create([
            'conversion_id' => $conversion->id,
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'amount' => $amount,
            'status' => $status,
        ]);
    }
}
