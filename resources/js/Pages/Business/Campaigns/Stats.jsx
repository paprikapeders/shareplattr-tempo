import BusinessLayout from '../../../Layouts/BusinessLayout';
import ConversionLabel from '../../../Components/ConversionLabel';
import { formatReward } from '../../../Support/rewards';
import usePollingStats from '../../../Support/usePollingStats';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);
}

function Stat({ label, value }) {
    return (
        <div className="min-h-[120px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
                {label === 'Conversions' ? <ConversionLabel>{label}</ConversionLabel> : label}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>
    );
}

function RecentCard({ title, children, empty }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-950">
                {title === 'Recent Conversions' ? <ConversionLabel>{title}</ConversionLabel> : title}
            </h2>
            {empty ? (
                <div className="border-t border-slate-100 pt-5 text-sm text-slate-500">{empty}</div>
            ) : (
                <div className="overflow-hidden border-t border-slate-100">{children}</div>
            )}
        </section>
    );
}

export default function Stats({ campaign, stats, recentClicks, recentConversions }) {
    const { stats: liveSummary, lastUpdatedAt } = usePollingStats(`/business/campaigns/${campaign.id}/stats-summary`, {
        stats,
        recentClicks,
        recentConversions,
    });
    const liveStats = liveSummary?.stats ?? stats;
    const liveRecentClicks = liveSummary?.recentClicks ?? recentClicks;
    const liveRecentConversions = liveSummary?.recentConversions ?? recentConversions;

    return (
        <BusinessLayout>
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
                <header className="mb-6">
                    <p className="text-xs font-bold uppercase text-slate-500">Business Campaign</p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-950">{campaign.title} Stats</h1>
                    <p className="mt-2 text-sm text-slate-500">Campaign performance scoped to your business only.</p>
                    {lastUpdatedAt && (
                        <p className="mt-2 text-xs font-medium text-slate-400">
                            Last updated {lastUpdatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                        </p>
                    )}
                </header>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Total Clicks" value={liveStats.total_clicks} />
                    <Stat label="Unique Clicks" value={liveStats.unique_clicks} />
                    <Stat label="Flagged Clicks" value={liveStats.flagged_clicks} />
                    <Stat label="Conversions" value={liveStats.conversions} />
                    <Stat label="Conversion Rate" value={`${liveStats.conversion_rate}%`} />
                    <Stat label="Reward Amount" value={formatReward(campaign)} />
                    <Stat label="Rewards Generated" value={dollars(liveStats.total_rewards_generated)} />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentCard title="Recent Clicks" empty={liveRecentClicks.length === 0 ? 'No clicks yet.' : null}>
                        <table className="w-full table-auto divide-y divide-slate-100">
                            <tbody className="divide-y divide-slate-100">
                                {liveRecentClicks.map((click) => (
                                    <tr key={click.id}>
                                        <td className="py-4 pr-3 text-sm text-slate-600">{click.ip_address}</td>
                                        <td className="px-3 py-4 text-sm text-slate-600">{click.is_flagged ? click.flag_reason || 'flagged' : 'unique'}</td>
                                        <td className="py-4 pl-3 text-right text-sm text-slate-500">{click.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </RecentCard>

                    <RecentCard title="Recent Conversions" empty={liveRecentConversions.length === 0 ? 'No conversions yet.' : null}>
                        <table className="w-full table-auto divide-y divide-slate-100">
                            <tbody className="divide-y divide-slate-100">
                                {liveRecentConversions.map((conversion) => (
                                    <tr key={conversion.id}>
                                        <td className="py-4 pr-3 text-sm font-semibold text-slate-950">{dollars(conversion.amount)}</td>
                                        <td className="px-3 py-4 text-sm text-slate-600">{conversion.status}</td>
                                        <td className="py-4 pl-3 text-right text-sm text-slate-500">{conversion.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </RecentCard>
                </div>
            </div>
        </BusinessLayout>
    );
}
