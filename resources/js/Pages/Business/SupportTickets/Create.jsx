import { Link, useForm } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import PageHeader from '../../../Components/PageHeader';

function attachmentError(errors) {
    return errors.attachments || Object.entries(errors).find(([key]) => key.startsWith('attachments.'))?.[1];
}

export default function Create({ categories = {}, priorities = {} }) {
    const form = useForm({
        subject: '',
        category: 'campaign_issue',
        priority: 'medium',
        message: '',
        attachments: [],
    });
    const selectedFiles = Array.from(form.data.attachments ?? []);

    function submit(event) {
        event.preventDefault();

        form.post('/business/support-tickets', {
            forceFormData: true,
        });
    }

    return (
        <BusinessLayout>
            <PageHeader
                title="Create Support Ticket"
                eyebrow="Business"
                description="Send the SharePlattr admin team the details they need to help."
            >
                <Button as={Link} href="/business/support-tickets" variant="secondary">Back to tickets</Button>
            </PageHeader>

            <Card>
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="subject">Subject</label>
                        <input
                            id="subject"
                            type="text"
                            value={form.data.subject}
                            onChange={(event) => form.setData('subject', event.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        />
                        {form.errors.subject && <p className="mt-1 text-sm text-rose-600">{form.errors.subject}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold text-slate-700" htmlFor="category">Category</label>
                            <select
                                id="category"
                                value={form.data.category}
                                onChange={(event) => form.setData('category', event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                            >
                                {Object.entries(categories).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            {form.errors.category && <p className="mt-1 text-sm text-rose-600">{form.errors.category}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700" htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                value={form.data.priority}
                                onChange={(event) => form.setData('priority', event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                            >
                                {Object.entries(priorities).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            {form.errors.priority && <p className="mt-1 text-sm text-rose-600">{form.errors.priority}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            rows="8"
                            value={form.data.message}
                            onChange={(event) => form.setData('message', event.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        />
                        {form.errors.message && <p className="mt-1 text-sm text-rose-600">{form.errors.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="attachments">Images</label>
                        <input
                            id="attachments"
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => form.setData('attachments', Array.from(event.target.files ?? []))}
                            className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                        />
                        <p className="mt-1 text-xs text-slate-500">JPG, JPEG, PNG, or WEBP. Up to 5 images, 5MB each.</p>
                        {selectedFiles.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-slate-600">
                                {selectedFiles.map((file) => (
                                    <li key={`${file.name}-${file.size}`}>{file.name}</li>
                                ))}
                            </ul>
                        )}
                        {attachmentError(form.errors) && <p className="mt-1 text-sm text-rose-600">{attachmentError(form.errors)}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Creating...' : 'Create Ticket'}
                        </Button>
                    </div>
                </form>
            </Card>
        </BusinessLayout>
    );
}
