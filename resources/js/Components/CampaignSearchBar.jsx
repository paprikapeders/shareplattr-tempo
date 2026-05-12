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
    onSubmit,
}) {
    return (
        <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] sm:h-12 sm:flex-row sm:items-center sm:rounded-full">
            <div className="sm:w-[170px]">
                <select
                    value={category}
                    onChange={(event) => onCategoryChange(event.target.value)}
                    className="h-12 w-full appearance-none border-0 bg-white px-5 text-sm font-medium text-slate-600 outline-none"
                >
                    <option value="all">Choose a category</option>
                    {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className="hidden h-12 w-px bg-slate-200 sm:block" />

            <div className="flex-1">
                <input
                    type="text"
                    value={keyword}
                    onChange={(event) => onKeywordChange(event.target.value)}
                    placeholder="Enter keywords, niche or category"
                    className="h-12 w-full border-0 bg-white px-5 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
            </div>

            <button
                type="submit"
                className="flex h-12 w-full shrink-0 items-center justify-center bg-[#08c4c4] text-white transition hover:bg-[#08b4b4] sm:w-16"
                aria-label="Search campaigns"
            >
                <SearchIcon />
            </button>
        </form>
    );
}
