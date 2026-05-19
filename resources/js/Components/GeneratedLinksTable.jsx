import EmptyState from './EmptyState';
import FilterBar from './FilterBar';
import TablePagination from './TablePagination';

function CopyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function OpenIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <path d="M14 3h7v7" />
            <path d="M10 14L21 3" />
            <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
    );
}

export default function GeneratedLinksTable({
    rows,
    filters,
    onFilterChange,
    hasAnyData = false,
    hasActiveFilters = false,
    onClearFilters,
    pageSize,
    onPageSizeChange,
    page,
    totalPages,
    totalItems,
    onPageChange,
    copiedId,
    onCopy,
    onExport,
}) {
    const isFilteredEmpty = rows.length === 0 && hasAnyData && hasActiveFilters;

    return (
        <section className="rounded-[28px] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
            <div className="border-b border-slate-200 px-6 py-6">
                <h2 className="text-[18px] font-semibold text-[#5a5d74]">Generated Links</h2>
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
                    onExport={onExport}
                />
            </div>

            {rows.length === 0 ? (
                <div className="px-6 pb-6">
                    <EmptyState
                        title={isFilteredEmpty ? 'No results match your filters' : 'No campaigns yet — create or join a campaign to get started.'}
                        description={isFilteredEmpty ? 'Try adjusting your filters or clear them to see all records.' : 'Create a referral link from the campaigns page to populate this table.'}
                        actionLabel={isFilteredEmpty ? 'Clear filters' : undefined}
                        onAction={isFilteredEmpty ? onClearFilters : undefined}
                    />
                </div>
            ) : (
                <>
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="min-w-full">
                            <thead className="border-y border-slate-200">
                                <tr className="text-left text-[13px] uppercase tracking-[0.18em] text-[#5a5d74]">
                                    <th className="px-6 py-4">Campaign</th>
                                    <th className="px-6 py-4">Referral Link</th>
                                    <th className="px-6 py-4 text-center">Clicks</th>
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
                                        <td className="px-6 py-5 font-mono text-[15px] text-[#6b7088]">{row.url.replace(/^https?:\/\//, '')}</td>
                                        <td className="px-6 py-5 text-center">{row.clicks_count}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-4">
                                                <a
                                                    href={row.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-slate-500 transition hover:text-[#6255e8]"
                                                    aria-label={`Open referral link for ${row.campaign_title}`}
                                                >
                                                    <OpenIcon />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => onCopy(row.id, row.url)}
                                                    className={`transition ${copiedId === row.id ? 'text-emerald-600' : 'text-slate-500 hover:text-[#6255e8]'}`}
                                                    aria-label={`Copy referral link for ${row.campaign_title}`}
                                                >
                                                    <CopyIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-3 px-6 pb-4 lg:hidden">
                        {rows.map((row) => (
                            <article key={row.id} className="rounded-[18px] border border-slate-200 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[15px] font-semibold text-[#2a3041]">{row.campaign_title}</p>
                                        <p className="mt-2 break-all font-mono text-xs text-slate-500">{row.url}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={row.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-slate-500 transition hover:text-[#6255e8]"
                                            aria-label={`Open referral link for ${row.campaign_title}`}
                                        >
                                            <OpenIcon />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => onCopy(row.id, row.url)}
                                            className={`transition ${copiedId === row.id ? 'text-emerald-600' : 'text-slate-500 hover:text-[#6255e8]'}`}
                                            aria-label={`Copy referral link for ${row.campaign_title}`}
                                        >
                                            <CopyIcon />
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-3 text-sm text-slate-500">Clicks: <span className="font-semibold text-[#2a3041]">{row.clicks_count}</span></p>
                            </article>
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
