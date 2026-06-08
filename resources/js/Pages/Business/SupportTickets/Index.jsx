import { Link } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import PageHeader from '../../../Components/PageHeader';

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function badgeClass(type, value) {
    const status = {
        open: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        pending: 'border-amber-200 bg-amber-50 text-amber-800',
        ongoing: 'border-cyan-200 bg-cyan-50 text-cyan-800',
        resolved: 'border-slate-200 bg-slate-100 text-slate-700',
    };
    const priority = {
        low: 'border-slate-200 bg-slate-50 text-slate-700',
        medium: 'border-blue-200 bg-blue-50 text-blue-800',
        high: 'border-orange-200 bg-orange-50 text-orange-800',
        urgent: 'border-rose-200 bg-rose-50 text-rose-800',
    };

    return (type === 'priority' ? priority[value] : status[value]) ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

function Badge({ type = 'status', value, children }) {
    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(type, value)}`}>
            {children}
        </span>
    );
}

export default function Index({ tickets = [] }) {
    return (
        <BusinessLayout>
            <PageHeader
                title="Support Tickets"
                eyebrow="Business"
                description="Create and track support requests for campaign, billing, payout, referral, or account concerns."
            >
                <Button as={Link} href="/business/support-tickets/create">Create Ticket</Button>
            </PageHeader>

            {tickets.length === 0 ? (
                <EmptyState
                    title="No support tickets yet."
                    description="Open a ticket when you need help from the SharePlattr admin team."
                />
            ) : (
                <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[840px] divide-y divide-slate-100 text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Ticket</th>
                                    <th className="px-5 py-3">Category</th>
                                    <th className="px-5 py-3">Priority</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Updated</th>
                                    <th className="px-5 py-3">Created</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-950">{ticket.subject}</div>
                                            <div className="mt-0.5 text-xs text-slate-500">{ticket.ticket_number}</div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{ticket.category_label}</td>
                                        <td className="px-5 py-4"><Badge type="priority" value={ticket.priority}>{ticket.priority_label}</Badge></td>
                                        <td className="px-5 py-4"><Badge value={ticket.status}>{ticket.status_label}</Badge></td>
                                        <td className="px-5 py-4 text-slate-600">{formatDate(ticket.updated_at)}</td>
                                        <td className="px-5 py-4 text-slate-600">{formatDate(ticket.created_at)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <Button as={Link} href={`/business/support-tickets/${ticket.id}`} variant="secondary">View</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </BusinessLayout>
    );
}
