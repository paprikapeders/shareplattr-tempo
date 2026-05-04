import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import FileUpload from '../../../Components/FileUpload';
import Input from '../../../Components/Input';
import Select from '../../../Components/Select';

export default function Form({ data, setData, errors, processing, statuses, brands, onSubmit, submitLabel }) {
    return (
        <Card className="max-w-3xl p-6">
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Brand</label>
                        <Select
                            value={data.brand_id}
                            onChange={(event) => setData('brand_id', event.target.value)}
                            className="mt-1"
                        >
                            <option value="">Select brand</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </Select>
                        {errors.brand_id && <p className="mt-1 text-sm text-rose-600">{errors.brand_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Title</label>
                        <Input
                            value={data.title}
                            onChange={(event) => setData('title', event.target.value)}
                            className="mt-1"
                        />
                        {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(event) => setData('description', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        rows="4"
                    />
                    {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <Input
                            value={data.category}
                            onChange={(event) => setData('category', event.target.value)}
                            className="mt-1"
                        />
                        {errors.category && <p className="mt-1 text-sm text-rose-600">{errors.category}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Reward Amount</label>
                        <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={data.reward_amount}
                            onChange={(event) => setData('reward_amount', event.target.value)}
                            className="mt-1"
                        />
                        <p className="mt-1 text-xs text-slate-500">Enter dollars, for example 12.00.</p>
                        {errors.reward_amount && <p className="mt-1 text-sm text-rose-600">{errors.reward_amount}</p>}
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

                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Destination URL</label>
                        <Input
                            type="url"
                            value={data.destination_url}
                            onChange={(event) => setData('destination_url', event.target.value)}
                            className="mt-1"
                        />
                        {errors.destination_url && <p className="mt-1 text-sm text-rose-600">{errors.destination_url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Expires At</label>
                        <Input
                            type="date"
                            value={data.expires_at}
                            onChange={(event) => setData('expires_at', event.target.value)}
                            className="mt-1"
                        />
                        {errors.expires_at && <p className="mt-1 text-sm text-rose-600">{errors.expires_at}</p>}
                    </div>
                </div>

                <div>
                    <FileUpload
                        label="Campaign Banner"
                        name="campaign_banner"
                        currentImageUrl={data.campaign_banner_url}
                        currentImageLabel="Current campaign banner"
                        onChange={(file) => setData('campaign_banner', file)}
                        error={errors.campaign_banner}
                    />
                </div>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : submitLabel}
                </Button>
            </form>
        </Card>
    );
}
