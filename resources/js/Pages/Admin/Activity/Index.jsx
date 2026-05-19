import AdminLayout from '../../../Layouts/AdminLayout';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import PageHeader from '../../../Components/PageHeader';

function formatDate(value) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function ActivityTable({ title, description, rows }) {
    return (
        <section>
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>

            {rows.length === 0 ? (
                <EmptyState title="No activity yet — start sharing to see results here." />
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Referral Token</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Participant</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">IP Address</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Reason</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {rows.map((row) => (
                                    <tr key={`${row.type}-${row.id}`} className="align-top transition hover:bg-slate-50/80">
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                                {row.type.replaceAll('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-xs text-slate-600">
                                            {row.referral_token ?? 'None'}
                                        </td>
                                        <td className="px-5 py-4">
                                            {row.participant ? (
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-950">{row.participant.name}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{row.participant.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">Unknown</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-600">
                                            {row.ip_address ?? 'Unknown'}
                                        </td>
                                        <td className="max-w-md px-5 py-4 text-sm leading-6 text-slate-600">
                                            {row.reason ?? 'No reason recorded.'}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                                            {formatDate(row.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </section>
    );
}

export default function Index({ blockedActivities, flaggedClicks }) {
    return (
        <AdminLayout>
            <PageHeader
                title="Suspicious Activity"
                eyebrow="Admin"
                description="Review blocked self-referral attempts and referral clicks that were flagged by the MVP rules."
            />

            <ActivityTable
                title="Blocked Activity"
                description="Self-referral attempts are blocked from creating clicks and logged here."
                rows={blockedActivities}
            />

            <ActivityTable
                title="Flagged Clicks"
                description="Duplicate clicks are still recorded but flagged for review."
                rows={flaggedClicks}
            />
        </AdminLayout>
    );
}
