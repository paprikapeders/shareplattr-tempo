import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
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
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const categories = useMemo(() => {
        return [...new Set(campaigns.map((campaign) => campaign.category).filter(Boolean))]
            .sort((first, second) => first.localeCompare(second));
    }, [campaigns]);
    const filteredCampaigns = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return campaigns.filter((campaign) => {
            const matchesSearch = normalizedSearch === ''
                || (campaign.title ?? '').toLowerCase().includes(normalizedSearch)
                || (campaign.brand_name ?? '').toLowerCase().includes(normalizedSearch);
            const matchesCategory = category === 'all' || campaign.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [campaigns, search, category]);

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

            {campaigns.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search campaigns or brands..."
                        className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm shadow-slate-950/5 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:w-64"
                    >
                        <option value="all">All categories</option>
                        {categories.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            )}

            {campaigns.length === 0 ? (
                <EmptyState title="No campaigns yet — create or join a campaign to get started." />
            ) : (
                <Card className="min-w-0 overflow-hidden p-0">
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full min-w-[960px] table-fixed divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="w-[30%] px-3 py-3.5 text-left text-xs font-semibold uppercase text-slate-500 xl:px-5">Campaign</th>
                                    <th className="w-[15%] px-3 py-3.5 text-left text-xs font-semibold uppercase text-slate-500 xl:px-5">Category</th>
                                    <th className="w-[18%] px-3 py-3.5 text-left text-xs font-semibold uppercase text-slate-500 xl:px-5">Reward</th>
                                    <th className="w-[11%] whitespace-nowrap px-3 py-3.5 text-left text-xs font-semibold uppercase text-slate-500 xl:px-5">Status</th>
                                    <th className="w-[8%] whitespace-nowrap px-3 py-3.5 text-right text-xs font-semibold uppercase text-slate-500 xl:px-5">Clicks</th>
                                    <th className="w-[11%] whitespace-nowrap px-3 py-3.5 text-right text-xs font-semibold uppercase text-slate-500 xl:px-5">
                                        <ConversionLabel className="justify-end">Conversions</ConversionLabel>
                                    </th>
                                    <th className="sticky right-0 z-10 w-24 whitespace-nowrap bg-slate-50/95 px-3 py-3.5 text-right text-xs font-semibold uppercase text-slate-500 xl:px-5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-10 text-center text-sm font-medium text-slate-500">
                                            No campaigns found.
                                        </td>
                                    </tr>
                                ) : filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="group transition hover:bg-slate-50/80">
                                        <td className="px-3 py-4 xl:px-5">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <ImageWithFallback
                                                    src={campaign.brand_logo_url}
                                                    alt=""
                                                    fallbackLabel={campaign.brand_name || campaign.title}
                                                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                                    showFallbackText={false}
                                                />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-950">{campaign.title}</p>
                                                    <p className="mt-1 truncate text-xs text-slate-500">{campaign.brand_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-slate-600 xl:px-5">
                                            <span className="block truncate">{campaign.category}</span>
                                        </td>
                                        <td className="px-3 py-4 text-sm xl:px-5">
                                            <p className="truncate font-semibold text-slate-950">{dollars(campaign.reward_amount)}</p>
                                            {campaign.commission_details && <p className="mt-1 truncate text-xs text-slate-500">{campaign.commission_details}</p>}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 xl:px-5">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(campaign.status)}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-slate-700 xl:px-5">{campaign.click_count}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-slate-700 xl:px-5">{campaign.conversion_count}</td>
                                        <td className="sticky right-0 z-10 whitespace-nowrap bg-white px-3 py-4 text-right transition group-hover:bg-slate-50/80 xl:px-5">
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
