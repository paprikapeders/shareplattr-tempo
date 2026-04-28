import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import PageHeader from '../../../Components/PageHeader';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

export default function Show({ brand }) {
    return (
        <AdminLayout>
            <PageHeader
                title={brand.name}
                eyebrow="Admin"
                description="Review the saved brand details and the campaigns currently connected to it."
            >
                <Button as={Link} href={`/admin/brands/${brand.id}/edit`} variant="secondary">
                    Edit Brand
                </Button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        {brand.logo_url ? (
                            <img src={brand.logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-500">
                                {brand.name[0]}
                            </div>
                        )}
                        <div>
                            <p className="text-lg font-semibold text-slate-950">{brand.name}</p>
                            <p className="mt-1 text-sm capitalize text-slate-500">{brand.status}</p>
                        </div>
                    </div>

                    <dl className="mt-6 space-y-4 text-sm text-slate-600">
                        <div>
                            <dt className="font-semibold text-slate-950">Business Type</dt>
                            <dd className="mt-1">{brand.business_type ?? 'Not set'}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-slate-950">Website</dt>
                            <dd className="mt-1">
                                {brand.website_url ? (
                                    <a href={brand.website_url} className="text-slate-700 underline underline-offset-2" target="_blank" rel="noreferrer">
                                        {brand.website_url}
                                    </a>
                                ) : 'Not set'}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-slate-950">Description</dt>
                            <dd className="mt-1">{brand.description ?? 'No description saved.'}</dd>
                        </div>
                    </dl>
                </Card>

                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-950">Connected Campaigns</h2>
                        <p className="mt-1 text-sm text-slate-500">These campaigns currently use this brand record.</p>
                    </div>

                    {brand.campaigns.length === 0 ? (
                        <EmptyState title="No campaigns connected yet.">
                            Attach this brand to a campaign from the admin campaign form.
                        </EmptyState>
                    ) : (
                        <Card className="overflow-hidden p-0">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Campaign</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Reward</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {brand.campaigns.map((campaign) => (
                                            <tr key={campaign.id}>
                                                <td className="px-5 py-4 text-sm font-medium text-slate-950">{campaign.title}</td>
                                                <td className="px-5 py-4 text-sm capitalize text-slate-600">{campaign.status}</td>
                                                <td className="px-5 py-4 text-sm text-slate-600">{dollars(campaign.reward_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
