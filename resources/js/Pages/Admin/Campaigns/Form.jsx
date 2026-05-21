import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import CharacterCounter from '../../../Components/CharacterCounter';
import DatePicker from '../../../Components/DatePicker';
import FileUpload from '../../../Components/FileUpload';
import Input from '../../../Components/Input';
import SearchableSelect from '../../../Components/SearchableSelect';
import Select from '../../../Components/Select';
import { CAMPAIGN_CATEGORY_OPTIONS, OTHER_KEY } from '../../../Support/taxonomy';

export default function Form({ data, setData, errors, processing, statuses, brands, onSubmit, submitLabel }) {
    const isPercentage = data.reward_type === 'percentage';

    return (
        <Card className="w-full p-6">
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Brand</label>
                        <Select
                            name="brand_id"
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
                            name="title"
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
                        maxLength={500}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        rows="4"
                    />
                    <CharacterCounter value={data.description} max={500} />
                    {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Campaign Category</label>
                        <SearchableSelect
                            name="category_key"
                            value={data.category_key}
                            onChange={(value) => {
                                setData('category_key', value);
                                if (value !== OTHER_KEY) {
                                    setData('category_other', '');
                                }
                            }}
                            options={CAMPAIGN_CATEGORY_OPTIONS}
                            placeholder="Search category"
                            error={Boolean(errors.category_key)}
                            className="mt-1"
                        />
                        {errors.category_key && <p className="mt-1 text-sm text-rose-600">{errors.category_key}</p>}
                        {data.category_key === OTHER_KEY && (
                            <div className="mt-3">
                                <Input
                                    name="category_other"
                                    value={data.category_other}
                                    onChange={(event) => setData('category_other', event.target.value)}
                                    error={Boolean(errors.category_other)}
                                    placeholder="Enter category"
                                />
                                {errors.category_other && <p className="mt-1 text-sm text-rose-600">{errors.category_other}</p>}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Reward Amount</label>
                        <Input
                            name="reward_amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={data.reward_amount}
                            onChange={(event) => setData('reward_amount', event.target.value)}
                            className="mt-1"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            {isPercentage ? 'Percentage of the verified order/conversion value paid per referral.' : 'Enter the fixed USD amount paid per conversion.'}
                        </p>
                        {errors.reward_amount && <p className="mt-1 text-sm text-rose-600">{errors.reward_amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <Select
                            name="status"
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

                <details className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-800">Imported affiliate metadata</summary>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Commission</label>
                            <Input
                                value={data.commission_details}
                                onChange={(event) => setData('commission_details', event.target.value)}
                                className="mt-1"
                            />
                            {errors.commission_details && <p className="mt-1 text-sm text-rose-600">{errors.commission_details}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Cookie Duration</label>
                            <Input
                                value={data.cookie_duration}
                                onChange={(event) => setData('cookie_duration', event.target.value)}
                                className="mt-1"
                            />
                            {errors.cookie_duration && <p className="mt-1 text-sm text-rose-600">{errors.cookie_duration}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Network / Platform</label>
                            <Input
                                value={data.network_platform}
                                onChange={(event) => setData('network_platform', event.target.value)}
                                className="mt-1"
                            />
                            {errors.network_platform && <p className="mt-1 text-sm text-rose-600">{errors.network_platform}</p>}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {[
                            ['payout_details', 'Payout Details'],
                            ['requirements', 'Requirements'],
                            ['deliverables', 'Deliverables'],
                            ['participant_instructions', 'Participant Instructions'],
                        ].map(([field, label]) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-slate-700">{label}</label>
                                <textarea
                                    value={data[field]}
                                    onChange={(event) => setData(field, event.target.value)}
                                    rows="3"
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                />
                                {errors[field] && <p className="mt-1 text-sm text-rose-600">{errors[field]}</p>}
                            </div>
                        ))}
                    </div>
                </details>

                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Destination URL</label>
                        <Input
                            name="destination_url"
                            type="url"
                            value={data.destination_url}
                            onChange={(event) => setData('destination_url', event.target.value)}
                            className="mt-1"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            The landing page participants will send traffic to. SharePlattr will append UTM parameters automatically.
                        </p>
                        {errors.destination_url && <p className="mt-1 text-sm text-rose-600">{errors.destination_url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Expires At</label>
                        <DatePicker name="expires_at" value={data.expires_at} onChange={(value) => setData('expires_at', value)} error={Boolean(errors.expires_at)} />
                        {errors.expires_at && <p className="mt-1 text-sm text-rose-600">{errors.expires_at}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Default share message</label>
                    <textarea
                        name="share_message_template"
                        value={data.share_message_template}
                        onChange={(event) => setData('share_message_template', event.target.value)}
                        maxLength={1000}
                        rows="5"
                        className={`mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors.share_message_template ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'}`}
                        aria-invalid={errors.share_message_template ? 'true' : undefined}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        You can use {'{business_name}'}, {'{campaign_title}'}, and {'{referral_link}'}.
                    </p>
                    <CharacterCounter value={data.share_message_template} max={1000} />
                    {errors.share_message_template && <p className="mt-1 text-sm text-rose-600">{errors.share_message_template}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Campaign Terms</label>
                    <textarea
                        name="campaign_terms"
                        value={data.campaign_terms}
                        onChange={(event) => setData('campaign_terms', event.target.value)}
                        rows="6"
                        className={`mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors.campaign_terms ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'}`}
                        aria-invalid={errors.campaign_terms ? 'true' : undefined}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Add eligibility, reward conditions, expiry, exclusions, and location restrictions. If left blank, generic SharePlattr referral terms will be shown.
                    </p>
                    {errors.campaign_terms && <p className="mt-1 text-sm text-rose-600">{errors.campaign_terms}</p>}
                </div>

                <div>
                    <FileUpload
                        label="Campaign Banner"
                        name="campaign_banner"
                        currentImageUrl={data.campaign_banner_url}
                        currentImageLabel="Current campaign banner"
                        helperText="Optional. Recommended size: 1200x400px. PNG or JPG."
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
