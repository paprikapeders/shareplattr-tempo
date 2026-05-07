import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import FileUpload from '../../../Components/FileUpload';
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Country / Region</label>
                        <Input
                            value={data.country_region}
                            onChange={(event) => setData('country_region', event.target.value)}
                            className="mt-1"
                            placeholder="Global, Australia, USA"
                        />
                        {errors.country_region && <p className="mt-1 text-sm text-rose-600">{errors.country_region}</p>}
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
                        <label className="block text-sm font-medium text-slate-700">Domain</label>
                        <Input
                            value={data.domain}
                            onChange={(event) => setData('domain', event.target.value)}
                            className="mt-1"
                            placeholder="example.com"
                        />
                        {errors.domain && <p className="mt-1 text-sm text-rose-600">{errors.domain}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Affiliate URL</label>
                        <Input
                            type="url"
                            value={data.affiliate_url}
                            onChange={(event) => setData('affiliate_url', event.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/affiliates"
                        />
                        {errors.affiliate_url && <p className="mt-1 text-sm text-rose-600">{errors.affiliate_url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">External Logo URL</label>
                        <Input
                            type="url"
                            value={data.logo_url}
                            onChange={(event) => setData('logo_url', event.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/favicon.ico"
                        />
                        {errors.logo_url && <p className="mt-1 text-sm text-rose-600">{errors.logo_url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Contact</label>
                        <Input
                            value={data.contact_info}
                            onChange={(event) => setData('contact_info', event.target.value)}
                            className="mt-1"
                            placeholder="affiliates@example.com"
                        />
                        {errors.contact_info && <p className="mt-1 text-sm text-rose-600">{errors.contact_info}</p>}
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
                    <label className="block text-sm font-medium text-slate-700">Notes</label>
                    <textarea
                        value={data.notes}
                        onChange={(event) => setData('notes', event.target.value)}
                        rows="3"
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                    {errors.notes && <p className="mt-1 text-sm text-rose-600">{errors.notes}</p>}
                </div>

                <div>
                    <FileUpload
                        label="Logo"
                        name="logo"
                        currentImageUrl={logoUrl}
                        currentImageLabel="Current logo"
                        onChange={(file) => setData('logo', file)}
                        error={errors.logo}
                    />
                </div>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : submitLabel}
                </Button>
            </form>
        </Card>
    );
}
