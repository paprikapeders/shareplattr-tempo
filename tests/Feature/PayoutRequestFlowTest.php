<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Conversion;
use App\Models\PayoutRequest;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PayoutRequestFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_request_payout_for_all_pending_rewards_once(): void
    {
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();

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

    public function test_participant_cannot_request_payout_for_another_users_rewards(): void
    {
        $participant = User::factory()->create();
        $otherParticipant = User::factory()->create();
        $campaign = $this->createCampaign();
        $ownReward = $this->createReward($participant, $campaign, 1200, 'pending');
        $otherReward = $this->createReward($otherParticipant, $campaign, 1800, 'pending');

        $this
            ->actingAs($participant)
            ->post(route('payout-requests.store'))
            ->assertRedirect()
            ->assertSessionHas('success', 'Payout request submitted.');

        $payoutRequest = PayoutRequest::firstOrFail();

        $this->assertSame(1200, $payoutRequest->amount);
        $this->assertDatabaseHas('payout_request_reward', [
            'payout_request_id' => $payoutRequest->id,
            'reward_id' => $ownReward->id,
        ]);
        $this->assertDatabaseMissing('payout_request_reward', [
            'payout_request_id' => $payoutRequest->id,
            'reward_id' => $otherReward->id,
        ]);
        $this->assertDatabaseHas('rewards', [
            'id' => $otherReward->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_view_all_payout_requests_but_not_control_them(): void
    {
        $admin = User::factory()->admin()->create();
        $businessOwner = User::factory()->businessOwner()->create(['name' => 'Business Owner']);
        $participant = User::factory()->create();
        $campaign = $this->createCampaign($businessOwner);
        $reward = $this->createReward($participant, $campaign, 2200, 'processing');
        $payoutRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 2200,
            'status' => 'approved',
            'requested_at' => now(),
            'business_approved_at' => now(),
            'business_approved_by' => $businessOwner->id,
            'stripe_payment_intent_id' => 'pi_test_123',
            'stripe_payment_status' => 'succeeded',
        ]);
        $payoutRequest->rewards()->attach($reward->id);

        $this
            ->actingAs($admin)
            ->get(route('admin.payout-requests.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/PayoutRequests/Index')
                ->where('payoutRequests.0.id', $payoutRequest->id)
                ->where('payoutRequests.0.participant.email', $participant->email)
                ->where('payoutRequests.0.business_approver.email', $businessOwner->email)
                ->where('payoutRequests.0.stripe_payment_intent_id', 'pi_test_123')
            );

        $this
            ->actingAs($admin)
            ->post(route('payout-requests.store'))
            ->assertForbidden();

        $this
            ->actingAs($admin)
            ->post('/admin/payout-requests/'.$payoutRequest->id.'/approve')
            ->assertNotFound();
    }

    public function test_admin_payout_request_page_filters_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();
        $approvedRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 1900,
            'status' => 'approved',
            'requested_at' => now(),
        ]);
        $pendingRequest = PayoutRequest::create([
            'user_id' => $participant->id,
            'amount' => 900,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $approvedRequest->rewards()->attach($this->createReward($participant, $campaign, 1900, 'processing')->id);
        $pendingRequest->rewards()->attach($this->createReward($participant, $campaign, 900, 'processing')->id);

        $this
            ->actingAs($admin)
            ->get(route('admin.payout-requests.index', ['status' => 'approved']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/PayoutRequests/Index')
                ->where('filters.status', 'approved')
                ->where('payoutRequests.0.id', $approvedRequest->id)
                ->missing('payoutRequests.1')
            );
    }

    public function test_participant_payout_eligibility_requires_verified_pending_reward(): void
    {
        $participant = User::factory()->create();
        $campaign = $this->createCampaign();
        $unverifiedConversion = Conversion::create([
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => 1200,
            'status' => 'pending',
        ]);

        Reward::create([
            'conversion_id' => $unverifiedConversion->id,
            'campaign_id' => $campaign->id,
            'user_id' => $participant->id,
            'amount' => 1200,
            'status' => 'pending',
        ]);

        $this
            ->actingAs($participant)
            ->post(route('payout-requests.store'))
            ->assertRedirect()
            ->assertSessionHas('error', 'There are no pending rewards available for payout right now.');

        $this->assertDatabaseCount('payout_requests', 0);

        $verifiedReward = $this->createReward($participant, $campaign, 1200, 'pending');

        $this
            ->actingAs($participant)
            ->get(route('payouts.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stats.available_balance', $verifiedReward->amount)
            );
    }

    private function createCampaign(?User $businessOwner = null): Campaign
    {
        return Campaign::create([
            'business_owner_id' => $businessOwner?->id,
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
