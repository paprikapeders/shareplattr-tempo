function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </svg>
    );
}

export default function CampaignSearchBar({
    category,
    categories,
    keyword,
    onCategoryChange,
    onKeywordChange,
}) {
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-[24px] border border-slate-200/80 bg-white p-2.5 shadow-[0_14px_35px_rgba(15,23,42,0.10)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2">
            <div className="sm:min-w-[42%]">
                <select
                    value={category}
                    onChange={(event) => onCategoryChange(event.target.value)}
                    className="h-11 w-full appearance-none rounded-full border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-700 outline-none sm:h-14 sm:border-0 sm:bg-transparent sm:px-5"
                >
                    <option value="all">Choose a platform</option>
                    {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="flex-1">
                <input
                    type="text"
                    value={keyword}
                    onChange={(event) => onKeywordChange(event.target.value)}
                    placeholder="Enter keywords, niche or category"
                    className="h-11 w-full rounded-full border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 sm:h-14 sm:border-0 sm:bg-transparent sm:px-5"
                />
            </div>

            <button
                type="button"
                className="flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 text-white shadow-[0_10px_20px_rgba(59,130,246,0.28)] transition hover:bg-blue-500 sm:h-12 sm:w-12"
                aria-label="Search campaigns"
            >
                <SearchIcon />
            </button>
        </div>
    );
}
