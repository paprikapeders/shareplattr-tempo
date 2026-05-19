import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import PageHeader from '../../../Components/PageHeader';

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

function filterHref(type, search) {
    const params = new URLSearchParams();

    if (type) {
        params.set('type', type);
    }

    if (search) {
        params.set('search', search);
    }

    const query = params.toString();

    return query ? `/admin/waitlist?${query}` : '/admin/waitlist';
}

function filterClasses(active) {
    if (active) {
        return 'border-slate-950 bg-slate-950 text-white shadow-slate-950/10';
    }

    return 'border-slate-200 bg-white text-slate-700 shadow-slate-950/5 hover:border-slate-300 hover:bg-slate-50';
}

function typeClasses(type) {
    if (type === 'business') {
        return 'border-indigo-200 bg-indigo-50 text-indigo-800';
    }

    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
}

function WaitlistRow({ submission }) {
    return (
        <tr className="align-top transition hover:bg-slate-50/80">
            <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-slate-950">#{submission.id}</td>
            <td className="px-5 py-5 text-sm font-semibold text-slate-950">{submission.email}</td>
            <td className="px-5 py-5">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${typeClasses(submission.type)}`}>
                    {submission.type}
                </span>
            </td>
            <td className="px-5 py-5 text-sm text-slate-600">{submission.source_page ?? 'Not captured'}</td>
            <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">{formatDate(submission.created_at)}</td>
        </tr>
    );
}

export default function Index({ submissions, filters, counts, unfilteredTotal = 0 }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const hasActiveFilters = Boolean(filters.search || filters.type);
    const isFilteredEmpty = submissions.length === 0 && hasActiveFilters && unfilteredTotal > 0;
    const tabs = [
        { label: 'All', value: null, count: counts.all },
        { label: 'Referrer', value: 'referrer', count: counts.referrer },
        { label: 'Business', value: 'business', count: counts.business },
    ];

    const submitSearch = (event) => {
        event.preventDefault();

        router.get('/admin/waitlist', {
            type: filters.type,
            search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/admin/waitlist', {}, {
            preserveState: false,
            replace: true,
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Waitlist"
                eyebrow="Admin"
                description="Review landing page join requests from referrers and businesses."
            />

            <div className="grid gap-3 sm:grid-cols-3">
                {tabs.map((tab) => {
                    const active = filters.type === tab.value;

                    return (
                        <Link
                            key={tab.label}
                            href={filterHref(tab.value, filters.search)}
                            className={[
                                'rounded-xl border p-4 shadow-sm transition',
                                filterClasses(active),
                            ].join(' ')}
                        >
                            <span className="block text-xs font-semibold uppercase opacity-70">{tab.label}</span>
                            <span className="mt-2 block text-2xl font-semibold">{tab.count}</span>
                        </Link>
                    );
                })}
            </div>

            <Card className="p-4">
                <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
                    <input
                        className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by email"
                        type="search"
                        value={search}
                    />
                    <button
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        type="submit"
                    >
                        Search
                    </button>
                    {(filters.search || filters.type) && (
                        <Link
                            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            href="/admin/waitlist"
                        >
                            Clear
                        </Link>
                    )}
                </form>
            </Card>

            {submissions.length === 0 ? (
                <EmptyState
                    title={isFilteredEmpty ? 'No results match your filters' : 'No waitlist requests yet.'}
                    description={isFilteredEmpty ? 'Try adjusting your filters or clear them to see all records.' : 'Landing page join requests will appear here.'}
                    actionLabel={isFilteredEmpty ? 'Clear filters' : undefined}
                    onAction={isFilteredEmpty ? clearFilters : undefined}
                />
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-100/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Request</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Source</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {submissions.map((submission) => (
                                    <WaitlistRow key={submission.id} submission={submission} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AdminLayout>
    );
}
