import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import FileUpload from '../../../Components/FileUpload';
import Input from '../../../Components/Input';
import Select from '../../../Components/Select';

export default function Form({ data, setData, errors, processing, statuses, onSubmit, submitLabel }) {
    const isPercentage = data.reward_type === 'percentage';

    return (
        <Card className="max-w-3xl p-6">
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Title</label>
                        <Input value={data.title} onChange={(event) => setData('title', event.target.value)} className="mt-1" />
                        {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <Input value={data.category} onChange={(event) => setData('category', event.target.value)} className="mt-1" />
                        {errors.category && <p className="mt-1 text-sm text-rose-600">{errors.category}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(event) => setData('description', event.target.value)}
                        rows="4"
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                    {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Reward Type</label>
                        <Select value={data.reward_type ?? 'flat'} onChange={(event) => setData('reward_type', event.target.value)} className="mt-1">
                            <option value="flat">Fixed amount ($)</option>
                            <option value="percentage">Percentage (%)</option>
                        </Select>
                        {errors.reward_type && <p className="mt-1 text-sm text-rose-600">{errors.reward_type}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">{isPercentage ? 'Reward Percentage' : 'Reward Amount'}</label>
                        <div className="relative mt-1">
                            <Input type="number" min="0.01" max={isPercentage ? '100' : undefined} step="0.01" value={data.reward_amount} onChange={(event) => setData('reward_amount', event.target.value)} className={isPercentage ? 'pr-9' : ''} />
                            {isPercentage && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-400">%</span>}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            {isPercentage ? 'Enter the conversion reward percentage.' : 'Enter the fixed USD amount paid per conversion.'}
                        </p>
                        {errors.reward_amount && <p className="mt-1 text-sm text-rose-600">{errors.reward_amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <Select value={data.status} onChange={(event) => setData('status', event.target.value)} className="mt-1">
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </Select>
                        {errors.status && <p className="mt-1 text-sm text-rose-600">{errors.status}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Expires At</label>
                        <Input type="date" value={data.expires_at} onChange={(event) => setData('expires_at', event.target.value)} className="mt-1" />
                        {errors.expires_at && <p className="mt-1 text-sm text-rose-600">{errors.expires_at}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Destination URL</label>
                    <Input type="url" value={data.destination_url} onChange={(event) => setData('destination_url', event.target.value)} className="mt-1" />
                    {errors.destination_url && <p className="mt-1 text-sm text-rose-600">{errors.destination_url}</p>}
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
