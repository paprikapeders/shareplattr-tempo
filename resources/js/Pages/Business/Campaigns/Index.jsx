import { Link } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import PageHeader from '../../../Components/PageHeader';
import { formatReward } from '../../../Support/rewards';

export default function Index({ campaigns }) {
    return (
        <BusinessLayout>
            <PageHeader title="Campaigns" eyebrow="Business" description="Create and manage campaigns owned by your business.">
                <Button as={Link} href="/business/campaigns/create">Create Campaign</Button>
            </PageHeader>

            {campaigns.length === 0 ? (
                <EmptyState title="No campaigns yet.">Create your first business campaign.</EmptyState>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Campaign</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Reward</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">Clicks</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id}>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-slate-950">{campaign.title}</p>
                                            <p className="text-xs text-slate-500">{campaign.category}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{campaign.status}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-950">{formatReward(campaign)}</td>
                                        <td className="px-5 py-4 text-right text-sm text-slate-600">{campaign.click_count}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button as={Link} href={`/business/campaigns/${campaign.id}`} variant="secondary">View</Button>
                                                <Button as={Link} href={`/business/campaigns/${campaign.id}/stats`} variant="secondary">Stats</Button>
                                                <Button as={Link} href={`/business/campaigns/${campaign.id}/edit`} variant="secondary">Edit</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </BusinessLayout>
    );
}
