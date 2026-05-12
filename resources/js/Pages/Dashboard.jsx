import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ActivityFeed from '../Components/ActivityFeed';
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

export default function Dashboard({ stats, referralLinks, activities }) {
    const { stats: liveSummary, lastUpdatedAt } = usePollingStats('/dashboard/stats-summary', {
        stats,
        referralLinks,
        activities,
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

    const filteredReferrals = useMemo(() => applyFilters(liveReferralLinks, referralFilters), [liveReferralLinks, referralFilters]);
    const filteredGeneratedLinks = useMemo(() => applyFilters(liveReferralLinks, generatedFilters), [liveReferralLinks, generatedFilters]);

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
        </DashboardLayout>
    );
}
