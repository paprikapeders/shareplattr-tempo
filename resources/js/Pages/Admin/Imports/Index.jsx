import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import PageHeader from '../../../Components/PageHeader';

function SummaryItem({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value ?? 0}</p>
        </div>
    );
}

export default function Index({ summary, duplicateImport }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        continue_duplicate: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/admin/imports', {
            forceFormData: true,
            onSuccess: () => reset('file'),
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Bulk Imports"
                eyebrow="Admin"
                description="Upload affiliate program spreadsheets, download templates, and export current brand and campaign data."
            >
                <Button as={Link} href="/admin/imports/template" variant="secondary">Download Template</Button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <Card className="p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">Excel or CSV file</label>
                            <input
                                type="file"
                                accept=".xlsx,.csv"
                                onChange={(event) => setData('file', event.target.files?.[0] ?? null)}
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm shadow-slate-950/5 file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                            />
                            {errors.file && <p className="mt-2 text-sm text-rose-600">{errors.file}</p>}
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                            <p className="font-semibold text-slate-900">Import instructions</p>
                            <p className="mt-2">Use the exact template columns from the source spreadsheet. Brand name and affiliate URL are required. Brands and campaigns are matched by normalized names, so rerunning the same file updates or skips rows instead of creating duplicates.</p>
                        </div>

                        {duplicateImport && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                                <p className="font-semibold">This exact file was already imported on {duplicateImport.imported_at}.</p>
                                <p className="mt-1">Select continue and upload it again if you still want to process it. Existing rows will remain protected by duplicate checks.</p>
                            </div>
                        )}

                        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={data.continue_duplicate}
                                onChange={(event) => setData('continue_duplicate', event.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-300"
                            />
                            <span>Continue even if this exact file was imported before</span>
                        </label>

                        <Button type="submit" disabled={processing || !data.file}>
                            {processing ? 'Importing...' : 'Upload and Import'}
                        </Button>
                    </form>
                </Card>

                <Card className="p-6">
                    <h2 className="text-sm font-bold uppercase text-slate-400">Exports</h2>
                    <div className="mt-4 space-y-3">
                        <Button as={Link} href="/admin/imports/export/brands" variant="secondary" className="w-full">Export Brands</Button>
                        <Button as={Link} href="/admin/imports/export/campaigns" variant="secondary" className="w-full">Export Campaigns</Button>
                        <Button as={Link} href="/admin/imports/export/all" variant="secondary" className="w-full">Export Combined Data</Button>
                    </div>
                </Card>
            </div>

            {summary && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-slate-950">Last import summary</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <SummaryItem label="Created rows" value={summary.created} />
                        <SummaryItem label="Updated rows" value={summary.updated} />
                        <SummaryItem label="Skipped rows" value={summary.skipped} />
                        <SummaryItem label="Failed rows" value={summary.failed ?? summary.failed_rows?.length} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryItem label="Brands created" value={summary.brands_created} />
                        <SummaryItem label="Brands updated" value={summary.brands_updated} />
                        <SummaryItem label="Campaigns created" value={summary.campaigns_created} />
                        <SummaryItem label="Campaigns updated" value={summary.campaigns_updated} />
                    </div>

                    {summary.failed_rows?.length > 0 && (
                        <div className="mt-5 overflow-x-auto rounded-lg border border-rose-100">
                            <table className="min-w-full divide-y divide-rose-100">
                                <thead className="bg-rose-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-rose-700">Row</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-rose-700">Errors</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-100 bg-white">
                                    {summary.failed_rows.map((failure) => (
                                        <tr key={failure.row}>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">{failure.row}</td>
                                            <td className="px-4 py-3 text-sm text-rose-700">{failure.errors.join(' ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </AdminLayout>
    );
}
