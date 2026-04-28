import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import CampaignCard from '../Components/CampaignCard';
import CampaignSearchBar from '../Components/CampaignSearchBar';
import EmptyState from '../Components/EmptyState';
import ClientLayout from '../Layouts/ClientLayout';

function PromoPanel() {
    return (
        <section className="grid gap-8 overflow-hidden rounded-[34px] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 lg:grid-cols-[0.95fr_1.05fr] lg:px-9 lg:py-10">
            <div className="flex flex-col justify-center">
                <p className="text-3xl font-semibold italic text-pink-500">Lemonade</p>
                <h2 className="mt-3 max-w-md text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Insuring the best user experience
                </h2>

                <div className="mt-8 space-y-5 text-lg leading-8 text-slate-500">
                    <div className="flex gap-3">
                        <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
                        <p>Customer-first experience: <span className="font-semibold text-slate-900">4.9 star app</span></p>
                    </div>
                    <div className="flex gap-3">
                        <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
                        <p>Data-informed decisions: <span className="font-semibold text-slate-900">95% of employees</span> use analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
                        <p>Business results: <span className="font-semibold text-slate-900">500% increase in policy holders</span>, IPO five years after founding</p>
                    </div>
                </div>

                <button type="button" className="mt-8 w-fit text-xl font-semibold text-violet-600 transition hover:text-violet-700">
                    Read Full Story
                </button>
            </div>

            <div className="relative min-h-[380px] overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,_#ffe8de_0%,_#fff6f2_45%,_#eadcff_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.95),_transparent_30%)]" />
                <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-[#f7c8b0]/55 blur-3xl" />
                <div className="absolute right-6 top-10 h-24 w-24 rounded-full border border-white/60 bg-white/50 backdrop-blur-sm" />
                <div className="absolute inset-x-10 bottom-10 top-10 rounded-[36px] bg-white/78 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur">
                    <div className="flex h-full items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,_#fff_0%,_#f6f2ff_100%)]">
                        <div className="w-[72%] rounded-[32px] bg-slate-950 p-3 shadow-2xl">
                            <div className="rounded-[28px] bg-white px-4 py-5">
                                <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-200" />
                                <p className="mt-4 text-center text-lg font-semibold italic text-pink-500">Lemonade</p>
                                <div className="mt-5 rounded-3xl border border-slate-100 bg-[#fff7fb] px-4 py-6 text-center">
                                    <p className="text-sm text-slate-500">Take Lemonade For A Spin!</p>
                                    <button type="button" className="mt-4 rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                                        Check Our Prices
                                    </button>
                                </div>
                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    <div className="h-12 rounded-2xl border border-slate-100 bg-slate-50" />
                                    <div className="h-12 rounded-2xl border border-slate-100 bg-slate-50" />
                                    <div className="h-12 rounded-2xl border border-slate-100 bg-slate-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Campaigns({ campaigns, categories }) {
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [category, setCategory] = useState('all');
    const [keyword, setKeyword] = useState('');
    const [generatingId, setGeneratingId] = useState(null);

    const visibleCampaigns = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return campaigns.filter((campaign) => {
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
            ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedKeyword));
        });
    }, [campaigns, category, keyword]);

    const generateLink = (campaignKey) => {
        setGeneratingId(campaignKey);

        router.post(`/campaigns/${campaignKey}/referral-link`, {}, {
            preserveScroll: true,
            onFinish: () => setGeneratingId(null),
        });
    };

    const copyLink = async (url) => {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        window.setTimeout(() => setCopiedUrl(null), 1800);
    };

    return (
        <ClientLayout>
            <div className="space-y-8 pb-4 pt-2 lg:space-y-12">
                <section className="rounded-[30px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4 py-6 text-center sm:px-8 sm:py-8 lg:px-12 lg:py-14">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[4.15rem] lg:leading-[1.05]">
                            Browse <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent">Campaign</span>
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:mt-4 sm:text-base">
                            Discover active brand partnerships, generate your link, and start sharing in a few clicks.
                        </p>

                        <div className="mt-5 sm:mt-6 lg:mt-9">
                            <CampaignSearchBar
                                category={category}
                                categories={categories}
                                keyword={keyword}
                                onCategoryChange={setCategory}
                                onKeywordChange={setKeyword}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Featured</h2>
                            <p className="mt-1 text-sm text-slate-500 sm:mt-2 sm:text-lg">Verified campaigns</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setCategory('all');
                                setKeyword('');
                            }}
                            className="text-base font-semibold text-slate-900 transition hover:text-blue-600"
                        >
                            See All
                        </button>
                    </div>

                    {visibleCampaigns.length === 0 ? (
                        <EmptyState title="No campaigns found.">
                            Try another category or keyword, or check back when new campaigns are active.
                        </EmptyState>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {visibleCampaigns.map((campaign) => (
                                <div key={campaign.id} className="h-full">
                                    <CampaignCard
                                        campaign={campaign}
                                        copiedUrl={copiedUrl}
                                        generating={generatingId === (campaign.slug ?? campaign.id)}
                                        onGenerateLink={generateLink}
                                        onCopyLink={copyLink}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <PromoPanel />
            </div>
        </ClientLayout>
    );
}
