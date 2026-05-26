import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import CampaignCard from '../Components/CampaignCard';
import CampaignSearchBar from '../Components/CampaignSearchBar';
import EmptyState from '../Components/EmptyState';
import ClientLayout from '../Layouts/ClientLayout';

const sortStorageKey = 'campaignBrowseSort';
const defaultSort = 'reward_desc';
const sortOptions = [
    { value: 'reward_desc', label: 'Reward (highest first)' },
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Popular' },
];

function CampaignGrid({ campaigns }) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </div>
    );
}

function SortControl({ value, onChange }) {
    return (
        <div className="flex w-full flex-col gap-1 text-left sm:w-auto sm:min-w-[230px]">
            <label htmlFor="campaign-sort" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Sort by
            </label>
            <select
                id="campaign-sort"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:border-[#08bcbc] focus:ring-4 focus:ring-cyan-100"
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function numericValue(value) {
    return Number(value ?? 0);
}

function popularityScore(campaign) {
    return numericValue(campaign.conversion_count) * 5
        + numericValue(campaign.click_count)
        + numericValue(campaign.participants_count) * 2;
}

function sortCampaigns(campaigns, sort) {
    return [...campaigns].sort((a, b) => {
        if (sort === 'newest') {
            const dateDifference = new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();

            return dateDifference || numericValue(b.id) - numericValue(a.id);
        }

        if (sort === 'popular') {
            return popularityScore(b) - popularityScore(a) || numericValue(b.reward_amount) - numericValue(a.reward_amount);
        }

        return numericValue(b.reward_amount) - numericValue(a.reward_amount) || numericValue(b.id) - numericValue(a.id);
    });
}

export default function Campaigns({ campaigns, searchResults = [], categories, filters = {}, unfilteredTotal = 0 }) {
    const [category, setCategory] = useState(filters.category ?? 'all');
    const [keyword, setKeyword] = useState(filters.search ?? '');
    const [sort, setSort] = useState(() => {
        if (typeof window === 'undefined') {
            return defaultSort;
        }

        return window.sessionStorage.getItem(sortStorageKey) || defaultSort;
    });
    const searchDebounceRef = useRef(null);
    const hasMountedRef = useRef(false);

    const activeSearch = (filters.search ?? '').trim();
    const hasActiveSearch = activeSearch.length > 0;
    const hasActiveFilters = hasActiveSearch || (filters.category ?? 'all') !== 'all';
    const visibleCampaigns = hasActiveSearch ? searchResults : campaigns;
    const isFilteredEmpty = hasActiveFilters && unfilteredTotal > 0 && visibleCampaigns.length === 0;
    const sortedCampaigns = useMemo(
        () => sortCampaigns(visibleCampaigns, sort),
        [visibleCampaigns, sort],
    );

    useEffect(() => {
        setCategory(filters.category ?? 'all');
        setKeyword(filters.search ?? '');
    }, [filters.category, filters.search]);

    useEffect(() => {
        window.sessionStorage.setItem(sortStorageKey, sort);
    }, [sort]);

    const requestCampaigns = (nextKeyword = keyword, nextCategory = category) => {
        router.get('/campaigns', {
            search: nextKeyword.trim() || undefined,
            category: nextCategory === 'all' ? undefined : nextCategory,
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return undefined;
        }

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => {
            const currentSearch = (filters.search ?? '').trim();
            const nextSearch = keyword.trim();
            const currentCategory = filters.category ?? 'all';

            if (nextSearch === currentSearch && category === currentCategory) {
                return;
            }

            requestCampaigns(keyword, category);
        }, 300);

        return () => clearTimeout(searchDebounceRef.current);
    }, [keyword]);

    const submitSearch = (event, nextCategory = category) => {
        event?.preventDefault();

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        requestCampaigns(keyword, nextCategory);
    };

    const changeCategory = (value) => {
        setCategory(value);

        requestCampaigns(keyword, value);
    };

    const resetFilters = () => {
        setCategory('all');
        setKeyword('');
        router.get('/campaigns', {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <ClientLayout>
            <div className="pb-8">
                <section className="mx-auto max-w-5xl px-2 pt-8 text-center sm:pt-10">
                    <h1 className="text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl">
                        Explore Campaign Marketplace
                    </h1>
                    <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        Find and share top campaigns across events, fintech, ecommerce, and more &mdash; earn for every conversion.
                    </p>

                    <div className="mt-7">
                        <CampaignSearchBar
                            category={category}
                            categories={categories}
                            keyword={keyword}
                            onCategoryChange={changeCategory}
                            onKeywordChange={setKeyword}
                            onSubmit={submitSearch}
                        />
                    </div>
                </section>

                <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-none text-slate-950">
                            {hasActiveSearch ? `Search results for: ${activeSearch}` : 'Campaign Marketplace'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {hasActiveFilters ? 'Matching available campaigns' : 'Sorted to help you find strong earning opportunities first'}
                        </p>
                    </div>
                    <SortControl value={sort} onChange={setSort} />
                </section>

                {visibleCampaigns.length === 0 ? (
                    <div className="mt-10">
                        <EmptyState
                            title={isFilteredEmpty ? 'No results match your filters' : 'No campaigns yet — create or join a campaign to get started.'}
                            description={isFilteredEmpty ? 'Try adjusting your filters or clear them to see all records.' : 'Check back when new campaigns are active.'}
                            actionLabel={isFilteredEmpty ? 'Clear filters' : undefined}
                            onAction={isFilteredEmpty ? resetFilters : undefined}
                        />
                    </div>
                ) : hasActiveFilters ? (
                    <section className="mt-5">
                        <div className="mb-4 flex justify-end">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-sm font-semibold text-[#08bcbc] transition hover:text-[#079999]"
                            >
                                See All &rarr;
                            </button>
                        </div>
                        <CampaignGrid campaigns={sortedCampaigns} />
                    </section>
                ) : (
                    <section className="mt-5">
                        <CampaignGrid campaigns={sortedCampaigns} />
                    </section>
                )}
            </div>
        </ClientLayout>
    );
}
