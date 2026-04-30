import BusinessLayout from '../../../Layouts/BusinessLayout';
import Card from '../../../Components/Card';
import PageHeader from '../../../Components/PageHeader';

function dollars(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);
}

function Stat({ label, value }) {
    return <Card><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></Card>;
}

export default function Stats({ campaign, stats, recentClicks, recentConversions }) {
    return (
        <BusinessLayout>
            <PageHeader title={`${campaign.title} Stats`} eyebrow="Business Campaign" description="Campaign performance scoped to your business only." />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Total Clicks" value={stats.total_clicks} />
                <Stat label="Unique Clicks" value={stats.unique_clicks} />
                <Stat label="Flagged Clicks" value={stats.flagged_clicks} />
                <Stat label="Conversions" value={stats.conversions} />
                <Stat label="Conversion Rate" value={`${stats.conversion_rate}%`} />
                <Stat label="Reward Amount" value={dollars(stats.reward_amount)} />
                <Stat label="Rewards Generated" value={dollars(stats.total_rewards_generated)} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <Card className="overflow-hidden p-0">
                    <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-950">Recent Clicks</h2></div>
                    <table className="min-w-full divide-y divide-slate-100">
                        <tbody className="divide-y divide-slate-100">
                            {recentClicks.map((click) => (
                                <tr key={click.id}>
                                    <td className="px-5 py-3 text-sm text-slate-600">{click.ip_address}</td>
                                    <td className="px-5 py-3 text-sm text-slate-600">{click.is_flagged ? click.flag_reason || 'flagged' : 'unique'}</td>
                                    <td className="px-5 py-3 text-right text-sm text-slate-500">{click.created_at}</td>
                                </tr>
                            ))}
                            {recentClicks.length === 0 && <tr><td className="px-5 py-6 text-sm text-slate-500" colSpan="3">No clicks yet.</td></tr>}
                        </tbody>
                    </table>
                </Card>

                <Card className="overflow-hidden p-0">
                    <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-950">Recent Conversions</h2></div>
                    <table className="min-w-full divide-y divide-slate-100">
                        <tbody className="divide-y divide-slate-100">
                            {recentConversions.map((conversion) => (
                                <tr key={conversion.id}>
                                    <td className="px-5 py-3 text-sm font-semibold text-slate-950">{dollars(conversion.amount)}</td>
                                    <td className="px-5 py-3 text-sm text-slate-600">{conversion.status}</td>
                                    <td className="px-5 py-3 text-right text-sm text-slate-500">{conversion.created_at}</td>
                                </tr>
                            ))}
                            {recentConversions.length === 0 && <tr><td className="px-5 py-6 text-sm text-slate-500" colSpan="3">No conversions yet.</td></tr>}
                        </tbody>
                    </table>
                </Card>
            </div>
        </BusinessLayout>
    );
}
