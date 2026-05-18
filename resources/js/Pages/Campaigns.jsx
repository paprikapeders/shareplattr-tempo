import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import CampaignCard from '../Components/CampaignCard';
import CampaignSearchBar from '../Components/CampaignSearchBar';
import EmptyState from '../Components/EmptyState';
import ClientLayout from '../Layouts/ClientLayout';

function SectionHeader({ title, subtitle, onSeeAll }) {
    return (
        <div className="mb-4 flex items-end justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold leading-none text-slate-950">{title}</h2>
                <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            </div>
            <button
                type="button"
                onClick={onSeeAll}
                className="shrink-0 text-sm font-semibold text-[#08bcbc] transition hover:text-[#079999]"
            >
                See All &rarr;
            </button>
        </div>
    );
}

function CampaignGrid({ campaigns }) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </div>
    );
}

export default function Campaigns({ campaigns, searchResults = [], categories, filters = {} }) {
    const [category, setCategory] = useState(filters.category ?? 'all');
    const [keyword, setKeyword] = useState(filters.search ?? '');

    const activeSearch = (filters.search ?? '').trim();
    const hasActiveSearch = activeSearch.length > 0;
    const visibleCampaigns = hasActiveSearch ? searchResults : campaigns;

    useEffect(() => {
        setCategory(filters.category ?? 'all');
        setKeyword(filters.search ?? '');
    }, [filters.category, filters.search]);

    const submitSearch = (event, nextCategory = category) => {
        event?.preventDefault();

        router.get('/campaigns', {
            search: keyword.trim() || undefined,
            category: nextCategory === 'all' ? undefined : nextCategory,
        }, {
            replace: true,
        });
    };

    const changeCategory = (value) => {
        setCategory(value);

        router.get('/campaigns', {
            search: keyword.trim() || undefined,
            category: value === 'all' ? undefined : value,
        }, {
            replace: true,
        });
    };

    const topPayingCampaigns = useMemo(
        () => [...visibleCampaigns].sort((a, b) => b.reward_amount - a.reward_amount),
        [visibleCampaigns],
    );

    const resetFilters = () => {
        setCategory('all');
        setKeyword('');
        router.get('/campaigns', {}, {
            replace: true,
        });
    };

    return (
        <ClientLayout>
            <div className="pb-8">
                <section className="mx-auto max-w-5xl px-2 pt-8 text-center sm:pt-10">
                    <h1 className="text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl">
                        Browse Campaigns
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

                {visibleCampaigns.length === 0 ? (
                    <div className="mt-10">
                        <EmptyState title="No campaigns found.">
                            Try another category or keyword, or check back when new campaigns are active.
                        </EmptyState>
                    </div>
                ) : hasActiveSearch ? (
                    <section className="mt-10">
                        <SectionHeader title={`Search results for: ${activeSearch}`} subtitle="Matching available campaigns" onSeeAll={resetFilters} />
                        <CampaignGrid campaigns={searchResults} />
                    </section>
                ) : (
                    <>
                        <section className="mt-10">
                            <SectionHeader title="Featured" subtitle="Verified campaigns" onSeeAll={resetFilters} />
                            <CampaignGrid campaigns={visibleCampaigns} />
                        </section>

                        <section className="mt-10">
                            <SectionHeader title="Top Paying" subtitle="Highest reward campaigns" onSeeAll={resetFilters} />
                            <CampaignGrid campaigns={topPayingCampaigns} />
                        </section>
                    </>
                )}
            </div>
        </ClientLayout>
    );
}
