import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
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
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(type, value)}`}>{children}</span>;
}

export default function Index({ tickets = [], counts = {}, filters = {}, statuses = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const statusOptions = useMemo(() => Object.entries(statuses), [statuses]);

    function applyFilters(next = {}) {
        router.get('/admin/support-tickets', {
            search,
            status: filters.status ?? '',
            ...next,
        }, {
            preserveState: true,
            replace: true,
        });
    }

    function submit(event) {
        event.preventDefault();
        applyFilters({ search });
    }

    return (
        <AdminLayout>
            <PageHeader
                title="Support Tickets"
                eyebrow="Admin"
                description="Review Business support tickets, reply to threads, and move tickets through resolution."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statusOptions.map(([value, label]) => (
                    <Card key={value} className="p-4">
                        <p className="text-xs font-semibold uppercase text-slate-500">{label} tickets</p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">{counts[value] ?? 0}</p>
                    </Card>
                ))}
            </div>

            <Card>
                <form onSubmit={submit} className="flex flex-col gap-3 lg:flex-row lg:items-end">
                    <div className="flex-1">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="search">Search</label>
                        <input
                            id="search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Subject, business name, or email"
                            className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="status">Status</label>
                        <select
                            id="status"
                            value={filters.status ?? ''}
                            onChange={(event) => applyFilters({ status: event.target.value })}
                            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 lg:w-48"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Search</Button>
                </form>
            </Card>

            {tickets.length === 0 ? (
                <EmptyState title="No support tickets found." />
            ) : (
                <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1080px] divide-y divide-slate-100 text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Ticket</th>
                                    <th className="px-5 py-3">Business</th>
                                    <th className="px-5 py-3">Category</th>
                                    <th className="px-5 py-3">Priority</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Last update</th>
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
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-950">{ticket.business.name}</div>
                                            <div className="mt-0.5 text-xs text-slate-500">{ticket.business.email}</div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{ticket.category_label}</td>
                                        <td className="px-5 py-4"><Badge type="priority" value={ticket.priority}>{ticket.priority_label}</Badge></td>
                                        <td className="px-5 py-4"><Badge value={ticket.status}>{ticket.status_label}</Badge></td>
                                        <td className="px-5 py-4 text-slate-600">{formatDate(ticket.updated_at)}</td>
                                        <td className="px-5 py-4 text-slate-600">{formatDate(ticket.created_at)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <Button as={Link} href={`/admin/support-tickets/${ticket.id}`} variant="secondary">View</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AdminLayout>
    );
}
