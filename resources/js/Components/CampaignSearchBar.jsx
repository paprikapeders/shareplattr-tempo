import SearchableSelect from './SearchableSelect';
import { CAMPAIGN_CATEGORY_OPTIONS } from '../Support/taxonomy';

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
    const categoryOptions = [
        { value: 'all', label: 'All Categories' },
        ...(categories?.length ? categories : CAMPAIGN_CATEGORY_OPTIONS),
    ];

    return (
        <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] sm:h-12 sm:flex-row sm:items-center sm:rounded-full">
            <div className="relative sm:h-full sm:w-[210px]">
                <SearchableSelect
                    name="category"
                    value={category}
                    onChange={onCategoryChange}
                    options={categoryOptions}
                    placeholder="All Categories"
                    clearValueOnType={false}
                    inputClassName="h-12 rounded-none border-0 bg-transparent px-5 text-sm font-medium text-slate-600 shadow-none outline-none focus:border-0 focus:ring-0 sm:h-full"
                    listboxClassName="min-w-64 rounded-2xl border-slate-200 bg-white text-sm shadow-lg shadow-slate-950/10"
                />
            </div>

            <div className="hidden h-12 w-px bg-slate-200 sm:block" />

            <div className="flex-1 sm:h-full">
                <input
                    type="text"
                    value={keyword}
                    onChange={(event) => onKeywordChange(event.target.value)}
                    placeholder="Enter keywords, niche or category"
                    className="h-12 w-full rounded-none border-0 bg-white px-5 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 sm:h-full"
                />
            </div>

            <button
                type="submit"
                className="flex h-12 w-full shrink-0 items-center justify-center rounded-none bg-[#08c4c4] text-white transition hover:bg-[#08b4b4] focus:outline-none focus:ring-4 focus:ring-cyan-100 sm:h-full sm:w-16"
                aria-label="Search campaigns"
            >
                <SearchIcon />
            </button>
        </form>
    );
}
