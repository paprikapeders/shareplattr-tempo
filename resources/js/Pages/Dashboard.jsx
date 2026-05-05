import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ActivityFeed from '../Components/ActivityFeed';
import DashboardLayout from '../Components/DashboardLayout';
import GeneratedLinksTable from '../Components/GeneratedLinksTable';
import MetricsCards from '../Components/MetricsCards';
import ReferralsTable from '../Components/ReferralsTable';

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

        const matchesStatus = filters.status === 'all' || item.campaign_status === filters.status;

        return matchesSearch && matchesStatus;
    });
}

function paginate(items, page, pageSize) {
    const start = (page - 1) * pageSize;

    return items.slice(start, start + pageSize);
}

export default function Dashboard({ stats, referralLinks, activities }) {
    const [referralFilters, setReferralFilters] = useState({
        role: 'all',
        plan: 'all',
        status: 'all',
        search: '',
    });
    const [generatedFilters, setGeneratedFilters] = useState({
        role: 'all',
        plan: 'all',
        status: 'all',
        search: '',
    });
    const [referralPageSize, setReferralPageSize] = useState(10);
    const [generatedPageSize, setGeneratedPageSize] = useState(10);
    const [referralPage, setReferralPage] = useState(1);
    const [generatedPage, setGeneratedPage] = useState(1);
    const [copiedId, setCopiedId] = useState(null);

    const filteredReferrals = useMemo(() => applyFilters(referralLinks, referralFilters), [referralLinks, referralFilters]);
    const filteredGeneratedLinks = useMemo(() => applyFilters(referralLinks, generatedFilters), [referralLinks, generatedFilters]);

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

    return (
        <DashboardLayout>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
                <div className="space-y-6">
                    <MetricsCards stats={stats} />
                </div>

                <ActivityFeed activities={activities} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="rounded-full bg-[linear-gradient(90deg,#d8dde9_0%,#c7ccd7_100%)] px-6 py-3 text-[15px] font-semibold text-[#16325f]">
                    REFERRALS
                </button>
                <Link href="/payouts" className="rounded-full bg-slate-100 px-6 py-3 text-[15px] font-semibold text-[#16325f]">
                    PAYOUTS
                </Link>
            </div>

            <div id="referrals">
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
            />
        </DashboardLayout>
    );
}
