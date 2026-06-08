import { Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import PageHeader from '../../../Components/PageHeader';

function formatDate(value) {
    if (!value) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function statusClass(status) {
    const classes = {
        open: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        pending: 'border-amber-200 bg-amber-50 text-amber-800',
        ongoing: 'border-cyan-200 bg-cyan-50 text-cyan-800',
        resolved: 'border-slate-200 bg-slate-100 text-slate-700',
    };

    return classes[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

function Badge({ status, children }) {
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{children}</span>;
}

function attachmentError(errors) {
    return errors.attachments || Object.entries(errors).find(([key]) => key.startsWith('attachments.'))?.[1];
}

function AttachmentGallery({ attachments = [] }) {
    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
                <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-lg border border-white/80 bg-white shadow-sm transition hover:opacity-90"
                    title={attachment.original_name}
                >
                    <img
                        src={attachment.url}
                        alt={attachment.original_name}
                        className="h-20 w-20 object-cover"
                    />
                </a>
            ))}
        </div>
    );
}

export default function Show({ ticket }) {
    const chatRef = useRef(null);
    const fileInputRef = useRef(null);
    const replyForm = useForm({ message: '', attachments: [] });
    const resolved = ticket.status === 'resolved';
    const selectedFiles = Array.from(replyForm.data.attachments ?? []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [ticket.messages.length]);

    function reply(event) {
        event.preventDefault();

        replyForm.post(`/business/support-tickets/${ticket.id}/reply`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                replyForm.reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    }

    function resolve() {
        router.patch(`/business/support-tickets/${ticket.id}/resolve`, {}, { preserveScroll: true });
    }

    function reopen() {
        router.patch(`/business/support-tickets/${ticket.id}/reopen`, {}, { preserveScroll: true });
    }

    return (
        <BusinessLayout>
            <PageHeader title={ticket.subject} eyebrow={ticket.ticket_number} description="Support ticket conversation">
                <Button as={Link} href="/business/support-tickets" variant="secondary">Back to tickets</Button>
                {resolved ? (
                    <Button type="button" onClick={reopen} variant="secondary">Reopen Ticket</Button>
                ) : (
                    <Button type="button" onClick={resolve} variant="secondary">Mark Resolved</Button>
                )}
            </PageHeader>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                    <Card className="p-0">
                        <div ref={chatRef} className="space-y-4 p-5 lg:max-h-[520px] lg:overflow-y-auto">
                            {ticket.messages.map((message) => {
                                const admin = message.sender_type === 'admin';

                                return (
                                    <div key={message.id} className={`rounded-xl border px-4 py-3 ${admin ? 'border-cyan-100 bg-cyan-50' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-slate-950">{admin ? 'Admin reply' : 'Your message'} - {message.sender_name}</p>
                                            <p className="text-xs font-medium text-slate-500">{formatDate(message.created_at)}</p>
                                        </div>
                                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{message.message}</p>
                                        <AttachmentGallery attachments={message.attachments} />
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card>
                        {resolved ? (
                            <p className="text-sm text-slate-600">This ticket is resolved. Reopen it before adding another reply.</p>
                        ) : (
                            <form onSubmit={reply} className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700" htmlFor="reply">Reply</label>
                                <textarea
                                    id="reply"
                                    rows="5"
                                    value={replyForm.data.message}
                                    onChange={(event) => replyForm.setData('message', event.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                                />
                                {replyForm.errors.message && <p className="text-sm text-rose-600">{replyForm.errors.message}</p>}
                                <div>
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="reply-attachments">Images</label>
                                    <input
                                        ref={fileInputRef}
                                        id="reply-attachments"
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(event) => replyForm.setData('attachments', Array.from(event.target.files ?? []))}
                                        className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                                    />
                                    {selectedFiles.length > 0 && (
                                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                                            {selectedFiles.map((file) => (
                                                <li key={`${file.name}-${file.size}`}>{file.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {attachmentError(replyForm.errors) && <p className="mt-1 text-sm text-rose-600">{attachmentError(replyForm.errors)}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={replyForm.processing}>{replyForm.processing ? 'Sending...' : 'Send Reply'}</Button>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>

                <Card>
                    <h2 className="text-sm font-bold text-slate-950">Ticket Details</h2>
                    <dl className="mt-4 space-y-4 text-sm">
                        <div>
                            <dt className="font-semibold text-slate-500">Status</dt>
                            <dd className="mt-1"><Badge status={ticket.status}>{ticket.status_label}</Badge></dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-slate-500">Category</dt>
                            <dd className="mt-1 text-slate-800">{ticket.category_label}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-slate-500">Priority</dt>
                            <dd className="mt-1 text-slate-800">{ticket.priority_label}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-slate-500">Created</dt>
                            <dd className="mt-1 text-slate-800">{formatDate(ticket.created_at)}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-slate-500">Updated</dt>
                            <dd className="mt-1 text-slate-800">{formatDate(ticket.updated_at)}</dd>
                        </div>
                    </dl>
                </Card>
            </div>
        </BusinessLayout>
    );
}
