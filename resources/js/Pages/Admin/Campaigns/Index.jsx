import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import ConversionLabel from '../../../Components/ConversionLabel';
import EmptyState from '../../../Components/EmptyState';
import ImageWithFallback from '../../../Components/ImageWithFallback';
import PageHeader from '../../../Components/PageHeader';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function statusClasses(status) {
    const classes = {
        active: 'bg-emerald-50 text-emerald-700',
        inactive: 'bg-slate-100 text-slate-700',
        draft: 'bg-amber-50 text-amber-700',
        paused: 'bg-cyan-50 text-cyan-700',
    };

    return classes[status] ?? classes.inactive;
}

export default function Index({ campaigns }) {
    return (
        <AdminLayout>
            <PageHeader
                title="Campaigns"
                eyebrow="Admin"
                description="Create and manage the campaigns participants can promote."
            >
                <Button as={Link} href="/admin/campaigns/create">
                    New Campaign
                </Button>
            </PageHeader>

            {campaigns.length === 0 ? (
                <EmptyState title="No campaigns yet.">Create your first campaign to make it available for participants.</EmptyState>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Campaign</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Category</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Reward</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate-500">Clicks</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate-500">
                                        <ConversionLabel className="justify-end">Conversions</ConversionLabel>
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="transition hover:bg-slate-50/80">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <ImageWithFallback
                                                    src={campaign.brand_logo_url}
                                                    alt=""
                                                    fallbackLabel={campaign.brand_name || campaign.title}
                                                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                                    showFallbackText={false}
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-950">{campaign.title}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{campaign.brand_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{campaign.category}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm">
                                            <p className="font-semibold text-slate-950">{dollars(campaign.reward_amount)}</p>
                                            {campaign.commission_details && <p className="mt-1 max-w-48 truncate text-xs text-slate-500">{campaign.commission_details}</p>}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(campaign.status)}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-700">{campaign.click_count}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-700">{campaign.conversion_count}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                            <Button as={Link} href={`/admin/campaigns/${campaign.id}/edit`} variant="secondary" aria-label="Edit campaign" title="Edit campaign">
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AdminLayout>
    );
}
