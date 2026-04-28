import { Link } from '@inertiajs/react';
import EmptyState from './EmptyState';
import FilterBar from './FilterBar';
import TablePagination from './TablePagination';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function Badge({ status }) {
    const isActive = status === 'active';

    return (
        <span className={`inline-flex rounded-[6px] px-3 py-1 text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}

function ActionIcons({ row }) {
    const campaignPath = `/campaigns/${row.campaign_slug ?? row.campaign_id}`;

    return (
        <div className="flex items-center justify-end gap-3 text-slate-500">
            <Link href={campaignPath} className="transition hover:text-[#6255e8]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
                </svg>
            </Link>
            <button type="button" onClick={() => navigator.clipboard.writeText(row.url)} className="transition hover:text-[#6255e8]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                    <path d="M9 15l6-6" />
                    <path d="M7.5 7.5a3.5 3.5 0 0 1 5 0l1 1" />
                    <path d="M10.5 16.5a3.5 3.5 0 0 1-5 0l-1-1a3.5 3.5 0 0 1 0-5l1.5-1.5" />
                    <path d="M13.5 7.5a3.5 3.5 0 0 1 5 0l1 1a3.5 3.5 0 0 1 0 5L18 15" />
                </svg>
            </button>
            <button type="button" className="transition hover:text-[#6255e8]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                </svg>
            </button>
        </div>
    );
}

function MobileCard({ row }) {
    return (
        <article className="rounded-[18px] border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[15px] font-semibold text-[#2a3041]">{row.campaign_title}</p>
                    <p className="mt-1 text-sm text-slate-500">{row.brand_name}</p>
                </div>
                <Badge status={row.campaign_status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em]">Clicks</p>
                    <p className="mt-1 text-base font-semibold text-[#2a3041]">{row.clicks_count}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.18em]">Conversions</p>
                    <p className="mt-1 text-base font-semibold text-[#2a3041]">{row.conversions_count}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.18em]">Total Earned</p>
                    <p className="mt-1 text-base font-semibold text-[#2a3041]">{dollars(row.total_earned)}</p>
                </div>
            </div>

            <div className="mt-4">
                <ActionIcons row={row} />
            </div>
        </article>
    );
}

export default function ReferralsTable({
    rows,
    filters,
    onFilterChange,
    pageSize,
    onPageSizeChange,
    page,
    totalPages,
    totalItems,
    onPageChange,
}) {
    return (
        <section className="rounded-[28px] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
            <div className="border-b border-slate-200 px-6 py-6">
                <h2 className="text-[18px] font-semibold text-[#5a5d74]">My Referrals</h2>
            </div>

            <div className="px-6 py-4">
                <FilterBar
                    filters={filters}
                    onChange={onFilterChange}
                    pageSize={pageSize}
                    onPageSizeChange={onPageSizeChange}
                    searchPlaceholder="Search"
                    actionLabel="Browse Campaigns"
                    actionHref="/campaigns"
                />
            </div>

            {rows.length === 0 ? (
                <div className="px-6 pb-6">
                    <EmptyState title="No referrals match your filters.">
                        Try adjusting the search or generate more campaign links.
                    </EmptyState>
                </div>
            ) : (
                <>
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="min-w-full">
                            <thead className="border-y border-slate-200">
                                <tr className="text-left text-[13px] uppercase tracking-[0.18em] text-[#5a5d74]">
                                    <th className="px-6 py-4">Campaign</th>
                                    <th className="px-6 py-4 text-center">Clicks</th>
                                    <th className="px-6 py-4 text-center">Conversions</th>
                                    <th className="px-6 py-4 text-center">Total Earned</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-200 text-[15px] text-[#6b7088]">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ece9ff] text-sm font-semibold text-[#7f70e5]">
                                                    {(row.brand_name ?? row.campaign_title).slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-[#5d6079]">{row.campaign_title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">{row.clicks_count}</td>
                                        <td className="px-6 py-5 text-center font-semibold text-[#5d6079]">{row.conversions_count}</td>
                                        <td className="px-6 py-5 text-center">{dollars(row.total_earned)}</td>
                                        <td className="px-6 py-5 text-center">
                                            <Badge status={row.campaign_status} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <ActionIcons row={row} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-3 px-6 pb-4 lg:hidden">
                        {rows.map((row) => (
                            <MobileCard key={row.id} row={row} />
                        ))}
                    </div>
                </>
            )}

            <TablePagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onChange={onPageChange}
            />
        </section>
    );
}
