function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-3.5-3.5" />
        </svg>
    );
}

function ExportIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M14 3h7v7" />
            <path d="M10 14L21 3" />
            <rect x="3" y="7" width="11" height="14" rx="2" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

const baseSelectClass = 'h-11 w-full rounded-[10px] border border-slate-200 bg-white px-4 text-[15px] text-slate-500 outline-none';

export default function FilterBar({
    filters,
    onChange,
    pageSize,
    onPageSizeChange,
    searchPlaceholder,
    actionLabel,
    actionHref,
}) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <select
                    value={pageSize}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                    className="h-11 w-24 rounded-[10px] border border-slate-200 bg-white px-4 text-[15px] text-slate-500 outline-none"
                >
                    {[10, 25, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(event) => onChange('search', event.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-11 w-full rounded-[10px] border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-600 outline-none placeholder:text-slate-400 sm:w-[220px]"
                        />
                    </div>

                    <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-slate-100 px-5 text-[15px] font-medium text-slate-400">
                        <ExportIcon />
                        <span>Export</span>
                    </button>

                    <a
                        href={actionHref}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(90deg,#7d72f2_0%,#6255e8_100%)] px-5 text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(99,91,236,0.22)]"
                    >
                        <PlusIcon />
                        <span>{actionLabel}</span>
                    </a>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <select value={filters.role} onChange={(event) => onChange('role', event.target.value)} className={baseSelectClass}>
                    <option value="all">Select Role</option>
                    <option value="participant">Participant</option>
                </select>
                <select value={filters.plan} onChange={(event) => onChange('plan', event.target.value)} className={baseSelectClass}>
                    <option value="all">Select Plan</option>
                    <option value="all-plans">All Plans</option>
                </select>
                <select value={filters.status} onChange={(event) => onChange('status', event.target.value)} className={baseSelectClass}>
                    <option value="all">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
    );
}
