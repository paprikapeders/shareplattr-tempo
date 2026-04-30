import { useMemo, useState } from 'react';
import CampaignCard from '../Components/CampaignCard';
import CampaignSearchBar from '../Components/CampaignSearchBar';
import EmptyState from '../Components/EmptyState';
import ClientLayout from '../Layouts/ClientLayout';

function campaignMatches(campaign, category, normalizedKeyword) {
    const matchesCategory = category === 'all' || campaign.category === category;

    if (!matchesCategory) {
        return false;
    }

    if (!normalizedKeyword) {
        return true;
    }

    return [
        campaign.brand_name,
        campaign.title,
        campaign.description,
        campaign.category,
        campaign.brand_industry,
    ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedKeyword));
}

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

export default function Campaigns({ campaigns, categories }) {
    const [category, setCategory] = useState('all');
    const [keyword, setKeyword] = useState('');

    const visibleCampaigns = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return campaigns.filter((campaign) => campaignMatches(campaign, category, normalizedKeyword));
    }, [campaigns, category, keyword]);

    const topPayingCampaigns = useMemo(
        () => [...visibleCampaigns].sort((a, b) => b.reward_amount - a.reward_amount),
        [visibleCampaigns],
    );

    const resetFilters = () => {
        setCategory('all');
        setKeyword('');
    };

    return (
        <ClientLayout>
            <div className="pb-8">
                <section className="mx-auto max-w-5xl px-2 pt-8 text-center sm:pt-10">
                    <h1 className="text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl">
                        Browse Campaign
                    </h1>
                    <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        Find and share top campaigns across events, fintech, ecommerce, and more &mdash; earn for every conversion.
                    </p>

                    <div className="mt-7">
                        <CampaignSearchBar
                            category={category}
                            categories={categories}
                            keyword={keyword}
                            onCategoryChange={setCategory}
                            onKeywordChange={setKeyword}
                        />
                    </div>
                </section>

                {visibleCampaigns.length === 0 ? (
                    <div className="mt-10">
                        <EmptyState title="No campaigns found.">
                            Try another category or keyword, or check back when new campaigns are active.
                        </EmptyState>
                    </div>
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
