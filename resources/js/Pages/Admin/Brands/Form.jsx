import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import Input from '../../../Components/Input';
import Select from '../../../Components/Select';

export default function Form({ data, setData, errors, processing, statuses, onSubmit, submitLabel, logoUrl = null }) {
    return (
        <Card className="max-w-3xl p-6">
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Brand Name</label>
                        <Input
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            className="mt-1"
                        />
                        {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Business Type</label>
                        <Input
                            value={data.business_type}
                            onChange={(event) => setData('business_type', event.target.value)}
                            className="mt-1"
                            placeholder="Retail, SaaS, Food & Drink"
                        />
                        {errors.business_type && <p className="mt-1 text-sm text-rose-600">{errors.business_type}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(event) => setData('description', event.target.value)}
                        rows="4"
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                    {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Website URL</label>
                        <Input
                            type="url"
                            value={data.website_url}
                            onChange={(event) => setData('website_url', event.target.value)}
                            className="mt-1"
                            placeholder="https://example.com"
                        />
                        {errors.website_url && <p className="mt-1 text-sm text-rose-600">{errors.website_url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <Select
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value)}
                            className="mt-1"
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                        {errors.status && <p className="mt-1 text-sm text-rose-600">{errors.status}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Logo</label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setData('logo', event.target.files[0] ?? null)}
                        className="mt-1"
                    />
                    <p className="mt-1 text-xs text-slate-500">Image files only, up to 2 MB.</p>
                    {errors.logo && <p className="mt-1 text-sm text-rose-600">{errors.logo}</p>}

                    {logoUrl && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <img src={logoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                            <p className="text-sm text-slate-600">Current logo</p>
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : submitLabel}
                </Button>
            </form>
        </Card>
    );
}
