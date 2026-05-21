import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import CharacterCounter from '../../../Components/CharacterCounter';
import DatePicker from '../../../Components/DatePicker';
import FieldLabel from '../../../Components/FieldLabel';
import FileUpload from '../../../Components/FileUpload';
import Input from '../../../Components/Input';
import SearchableSelect from '../../../Components/SearchableSelect';
import Select from '../../../Components/Select';
import { CAMPAIGN_CATEGORY_OPTIONS, OTHER_KEY } from '../../../Support/taxonomy';

export default function Form({ data, setData, errors, processing, statuses, onSubmit, submitLabel }) {
    const isPercentage = data.reward_type === 'percentage';

    return (
        <Card className="w-full p-6">
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <FieldLabel required>Campaign Title</FieldLabel>
                        <Input name="title" value={data.title} onChange={(event) => setData('title', event.target.value)} error={Boolean(errors.title)} className="mt-1" />
                        {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title}</p>}
                    </div>

                    <div>
                        <FieldLabel required>Campaign Category</FieldLabel>
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
                </div>

                <div>
                    <FieldLabel required>Description</FieldLabel>
                    <textarea
                        name="description"
                        value={data.description}
                        onChange={(event) => setData('description', event.target.value)}
                        maxLength={500}
                        rows="4"
                        className={`mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:ring-4 ${errors.description ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'}`}
                        aria-invalid={errors.description ? 'true' : undefined}
                    />
                    <CharacterCounter value={data.description} max={500} />
                    {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <FieldLabel required>Reward Type</FieldLabel>
                        <Select name="reward_type" value={data.reward_type ?? 'flat'} onChange={(event) => setData('reward_type', event.target.value)} error={Boolean(errors.reward_type)} className="mt-1">
                            <option value="flat">Fixed amount ($)</option>
                            <option value="percentage">Percentage (%)</option>
                        </Select>
                        {errors.reward_type && <p className="mt-1 text-sm text-rose-600">{errors.reward_type}</p>}
                    </div>

                    <div>
                        <FieldLabel required>{isPercentage ? 'Reward Percentage' : 'Reward Amount'}</FieldLabel>
                        <div className="relative mt-1">
                            <Input name="reward_amount" type="number" min="0.01" max={isPercentage ? '100' : undefined} step="0.01" value={data.reward_amount} onChange={(event) => setData('reward_amount', event.target.value)} error={Boolean(errors.reward_amount)} className={isPercentage ? 'pr-9' : ''} />
                            {isPercentage && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-400">%</span>}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            {isPercentage ? 'Percentage of the verified order/conversion value paid per referral.' : 'Enter the fixed USD amount paid per conversion.'}
                        </p>
                        {errors.reward_amount && <p className="mt-1 text-sm text-rose-600">{errors.reward_amount}</p>}
                    </div>

                    <div>
                        <FieldLabel required>Status</FieldLabel>
                        <Select name="status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={Boolean(errors.status)} className="mt-1">
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </Select>
                        {errors.status && <p className="mt-1 text-sm text-rose-600">{errors.status}</p>}
                    </div>

                    <div>
                        <FieldLabel>Expires At</FieldLabel>
                        <DatePicker name="expires_at" value={data.expires_at} onChange={(value) => setData('expires_at', value)} error={Boolean(errors.expires_at)} />
                        {errors.expires_at && <p className="mt-1 text-sm text-rose-600">{errors.expires_at}</p>}
                    </div>
                </div>

                <div>
                    <FieldLabel required>Destination URL</FieldLabel>
                    <Input name="destination_url" type="url" value={data.destination_url} onChange={(event) => setData('destination_url', event.target.value)} error={Boolean(errors.destination_url)} className="mt-1" />
                    <p className="mt-1 text-xs text-slate-500">
                        The landing page participants will send traffic to. SharePlattr will append UTM parameters automatically.
                    </p>
                    {errors.destination_url && <p className="mt-1 text-sm text-rose-600">{errors.destination_url}</p>}
                </div>

                <div>
                    <FieldLabel>Default share message</FieldLabel>
                    <textarea
                        name="share_message_template"
                        value={data.share_message_template}
                        onChange={(event) => setData('share_message_template', event.target.value)}
                        maxLength={1000}
                        rows="5"
                        className={`mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:ring-4 ${errors.share_message_template ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'}`}
                        aria-invalid={errors.share_message_template ? 'true' : undefined}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        You can use {'{business_name}'}, {'{campaign_title}'}, and {'{referral_link}'}.
                    </p>
                    <CharacterCounter value={data.share_message_template} max={1000} />
                    {errors.share_message_template && <p className="mt-1 text-sm text-rose-600">{errors.share_message_template}</p>}
                </div>

                <div>
                    <FieldLabel>Campaign Terms</FieldLabel>
                    <textarea
                        name="campaign_terms"
                        value={data.campaign_terms}
                        onChange={(event) => setData('campaign_terms', event.target.value)}
                        rows="6"
                        className={`mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:ring-4 ${errors.campaign_terms ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'}`}
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
