import { Link } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import PageHeader from '../../../Components/PageHeader';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function Show({ campaign }) {
    return (
        <BusinessLayout>
            <PageHeader title={campaign.title} eyebrow="Business Campaign" description={campaign.description}>
                <Button as={Link} href={`/business/campaigns/${campaign.id}/edit`} variant="secondary">Edit</Button>
                <Button as={Link} href={`/business/campaigns/${campaign.id}/stats`}>Stats</Button>
            </PageHeader>

            {campaign.campaign_banner_url && <img src={campaign.campaign_banner_url} alt="" className="h-64 w-full rounded-lg object-cover" />}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card><p className="text-sm text-slate-500">Status</p><p className="mt-2 text-xl font-semibold">{campaign.status}</p></Card>
                <Card><p className="text-sm text-slate-500">Reward</p><p className="mt-2 text-xl font-semibold">{dollars(campaign.reward_amount)}</p></Card>
                <Card><p className="text-sm text-slate-500">Clicks</p><p className="mt-2 text-xl font-semibold">{campaign.click_count}</p></Card>
                <Card><p className="text-sm text-slate-500">Conversions</p><p className="mt-2 text-xl font-semibold">{campaign.conversion_count}</p></Card>
            </div>

            <Card>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div><dt className="font-semibold text-slate-700">Category</dt><dd className="mt-1 text-slate-600">{campaign.category}</dd></div>
                    <div><dt className="font-semibold text-slate-700">Expires At</dt><dd className="mt-1 text-slate-600">{campaign.expires_at || 'No expiry'}</dd></div>
                    <div className="sm:col-span-2"><dt className="font-semibold text-slate-700">Destination URL</dt><dd className="mt-1 break-all text-slate-600">{campaign.destination_url}</dd></div>
                </dl>
            </Card>
        </BusinessLayout>
    );
}
