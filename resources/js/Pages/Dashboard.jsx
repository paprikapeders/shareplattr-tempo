import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ActivityFeed from '../Components/ActivityFeed';
import Button from '../Components/Button';
import DashboardLayout from '../Components/DashboardLayout';
import GeneratedLinksTable from '../Components/GeneratedLinksTable';
import MetricsCards from '../Components/MetricsCards';
import ReferralsTable from '../Components/ReferralsTable';
import usePollingStats from '../Support/usePollingStats';

function clampPage(page, totalPages) {
    if (totalPages === 0) {
        return 1;
    }

    return Math.min(page, totalPages);
}

function applyFilters(items, filters) {
    const search = filters.search.trim().toLowerCase();

    return items.filter((item) => {
        const matchesSearch = !search || [
            item.campaign_title,
            item.brand_name,
            item.url,
        ].filter(Boolean).some((value) => value.toLowerCase().includes(search));

        const matchesStatus = filters.status === 'all'
            || item.campaign_status === filters.status
            || (filters.status === 'inactive' && item.campaign_status !== 'active');

        return matchesSearch && matchesStatus;
    });
}

function hasActiveTableFilters(filters) {
    return filters.status !== 'all' || filters.search.trim() !== '';
}

function paginate(items, page, pageSize) {
    const start = (page - 1) * pageSize;

    return items.slice(start, start + pageSize);
}

function csvEscape(value) {
    const normalized = String(value ?? '');

    return /[",\n]/.test(normalized) ? `"${normalized.replaceAll('"', '""')}"` : normalized;
}

function downloadCsv(filename, headers, rows) {
    const csv = [
        headers.map(csvEscape).join(','),
        ...rows.map((row) => row.map(csvEscape).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function dollars(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4">
            <path d="M5 12.5 10 17l9-10" />
        </svg>
    );
}

function OnboardingChecklist({ steps }) {
    return (
        <div className="rounded-[22px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:p-6">
            <h2 className="text-lg font-bold text-[#2a3041]">Get ready to earn</h2>
            <div className="mt-5 space-y-3">
                {steps.map((step, index) => (
                    <Link
                        key={step.key}
                        href={step.href}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
                    >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step.completed ? 'bg-[#08bcbc] text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
                            {step.completed ? <CheckIcon /> : index + 1}
                        </span>
                        <span className={`text-sm font-semibold ${step.completed ? 'text-slate-500 line-through' : 'text-[#2a3041]'}`}>
                            {step.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function OnboardingEmptyState({ onboarding }) {
    return (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <section className="min-w-0 rounded-[28px] bg-white px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:px-8 sm:py-10">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#08bcbc]">Welcome to SharePlattr</p>
                <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-[#111111] sm:text-4xl">
                    Start by choosing a campaign to share.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                    Browse live campaigns, generate your first referral link, then add your payout method when you are ready to receive rewards.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                    <Button as={Link} href="/campaigns" className="rounded-full px-6 py-3 text-base">
                        Browse campaigns
                    </Button>
                    <Button as={Link} href="/payouts" variant="secondary" className="rounded-full px-6 py-3 text-base">
                        Payouts
                    </Button>
                </div>
            </section>

            <OnboardingChecklist steps={onboarding.steps ?? []} />
        </div>
    );
}

export default function Dashboard({ stats, referralLinks, activities, onboarding }) {
    const { stats: liveSummary, lastUpdatedAt } = usePollingStats('/dashboard/stats-summary', {
        stats,
        referralLinks,
        activities,
        onboarding,
    });
    const [referralFilters, setReferralFilters] = useState({
        status: 'all',
        search: '',
    });
    const [generatedFilters, setGeneratedFilters] = useState({
        status: 'all',
        search: '',
    });
    const [referralPageSize, setReferralPageSize] = useState(10);
    const [generatedPageSize, setGeneratedPageSize] = useState(10);
    const [referralPage, setReferralPage] = useState(1);
    const [generatedPage, setGeneratedPage] = useState(1);
    const [copiedId, setCopiedId] = useState(null);
    const liveStats = liveSummary?.stats ?? stats;
    const liveReferralLinks = liveSummary?.referralLinks ?? referralLinks;
    const liveActivities = liveSummary?.activities ?? activities;
    const liveOnboarding = liveSummary?.onboarding ?? onboarding;

    const filteredReferrals = useMemo(() => applyFilters(liveReferralLinks, referralFilters), [liveReferralLinks, referralFilters]);
    const filteredGeneratedLinks = useMemo(() => applyFilters(liveReferralLinks, generatedFilters), [liveReferralLinks, generatedFilters]);
    const hasReferralData = liveReferralLinks.length > 0;
    const hasGeneratedLinkData = liveReferralLinks.length > 0;
    const hasActiveReferralFilters = hasActiveTableFilters(referralFilters);
    const hasActiveGeneratedFilters = hasActiveTableFilters(generatedFilters);

    const referralTotalPages = Math.ceil(filteredReferrals.length / referralPageSize);
    const generatedTotalPages = Math.ceil(filteredGeneratedLinks.length / generatedPageSize);
    const safeReferralPage = clampPage(referralPage, referralTotalPages);
    const safeGeneratedPage = clampPage(generatedPage, generatedTotalPages);

    const pagedReferrals = useMemo(
        () => paginate(filteredReferrals, safeReferralPage, referralPageSize),
        [filteredReferrals, safeReferralPage, referralPageSize],
    );
    const pagedGeneratedLinks = useMemo(
        () => paginate(filteredGeneratedLinks, safeGeneratedPage, generatedPageSize),
        [filteredGeneratedLinks, safeGeneratedPage, generatedPageSize],
    );

    const handleCopy = async (id, value) => {
        await navigator.clipboard.writeText(value);
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1800);
    };

    const clearReferralFilters = () => {
        setReferralFilters({ status: 'all', search: '' });
        setReferralPage(1);
    };

    const clearGeneratedFilters = () => {
        setGeneratedFilters({ status: 'all', search: '' });
        setGeneratedPage(1);
    };

    const exportReferrals = () => {
        downloadCsv(
            'shareplattr-referrals.csv',
            ['campaign', 'clicks', 'conversions', 'total earned', 'status'],
            filteredReferrals.map((row) => [
                row.campaign_title,
                row.clicks_count,
                row.conversions_count,
                dollars(row.total_earned),
                row.campaign_status,
            ]),
        );
    };

    const exportGeneratedLinks = () => {
        downloadCsv(
            'shareplattr-generated-links.csv',
            ['campaign', 'referral link', 'clicks', 'status'],
            filteredGeneratedLinks.map((row) => [
                row.campaign_title,
                row.url,
                row.clicks_count,
                row.campaign_status,
            ]),
        );
    };

    return (
        <DashboardLayout>
            {liveOnboarding?.show ? (
                <OnboardingEmptyState onboarding={liveOnboarding} />
            ) : (
                <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                <div className="min-w-0 space-y-5">
                    <MetricsCards stats={liveStats} />
                    {lastUpdatedAt && (
                        <p className="-mt-3 text-xs font-medium text-slate-400">
                            Last updated {lastUpdatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className="rounded-full bg-[linear-gradient(90deg,#d8dde9_0%,#c7ccd7_100%)] px-6 py-3 text-[15px] font-semibold text-[#16325f]">
                            REFERRALS
                        </button>
                        <Link href="/payouts" className="rounded-full bg-slate-100 px-6 py-3 text-[15px] font-semibold text-[#16325f]">
                            PAYOUTS
                        </Link>
                    </div>

                    <div id="referrals" className="min-w-0">
                        <ReferralsTable
                            rows={pagedReferrals}
                            filters={referralFilters}
                            hasAnyData={hasReferralData}
                            hasActiveFilters={hasActiveReferralFilters}
                            onClearFilters={clearReferralFilters}
                            onFilterChange={(key, value) => {
                                setReferralFilters((current) => ({ ...current, [key]: value }));
                                setReferralPage(1);
                            }}
                            pageSize={referralPageSize}
                            onPageSizeChange={(value) => {
                                setReferralPageSize(value);
                                setReferralPage(1);
                            }}
                            page={safeReferralPage}
                            totalPages={referralTotalPages}
                            totalItems={filteredReferrals.length}
                            onPageChange={setReferralPage}
                            onExport={exportReferrals}
                        />
                    </div>

                    <GeneratedLinksTable
                        rows={pagedGeneratedLinks}
                        filters={generatedFilters}
                        hasAnyData={hasGeneratedLinkData}
                        hasActiveFilters={hasActiveGeneratedFilters}
                        onClearFilters={clearGeneratedFilters}
                        onFilterChange={(key, value) => {
                            setGeneratedFilters((current) => ({ ...current, [key]: value }));
                            setGeneratedPage(1);
                        }}
                        pageSize={generatedPageSize}
                        onPageSizeChange={(value) => {
                            setGeneratedPageSize(value);
                            setGeneratedPage(1);
                        }}
                        page={safeGeneratedPage}
                        totalPages={generatedTotalPages}
                        totalItems={filteredGeneratedLinks.length}
                        onPageChange={setGeneratedPage}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                        onExport={exportGeneratedLinks}
                    />
                </div>

                <ActivityFeed activities={liveActivities} />
                </div>
            )}
        </DashboardLayout>
    );
}
