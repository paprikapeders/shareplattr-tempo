import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import Input from '../../../Components/Input';
import PageHeader from '../../../Components/PageHeader';
import Select from '../../../Components/Select';

export default function Create({ campaigns, users }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        campaign_id: '',
        user_id: '',
        amount: '',
        amount_type: 'dollars',
        notes: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post('/admin/conversions', {
            preserveScroll: true,
            onSuccess: () => reset('amount', 'notes'),
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Enter Conversion"
                eyebrow="Admin"
                description="Record a verified conversion and create the pending reward for the selected participant."
            />

            <Card className="max-w-3xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Campaign</label>
                        <Select
                            value={data.campaign_id}
                            onChange={(event) => setData('campaign_id', event.target.value)}
                            className="mt-1"
                        >
                            <option value="">Select campaign</option>
                            {campaigns.map((campaign) => (
                                <option key={campaign.id} value={campaign.id}>
                                    {(campaign.brand?.name ?? campaign.brand_name)} - {campaign.title}
                                </option>
                            ))}
                        </Select>
                        {errors.campaign_id && <p className="mt-1 text-sm text-rose-600">{errors.campaign_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Participant</label>
                        <Select
                            value={data.user_id}
                            onChange={(event) => setData('user_id', event.target.value)}
                            className="mt-1"
                        >
                            <option value="">Select participant</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </Select>
                        {errors.user_id && <p className="mt-1 text-sm text-rose-600">{errors.user_id}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Amount</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.amount}
                                onChange={(event) => setData('amount', event.target.value)}
                                className="mt-1"
                            />
                            {errors.amount && <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Type</label>
                            <Select
                                value={data.amount_type}
                                onChange={(event) => setData('amount_type', event.target.value)}
                                className="mt-1"
                            >
                                <option value="dollars">Dollars</option>
                                <option value="cents">Cents</option>
                            </Select>
                            {errors.amount_type && <p className="mt-1 text-sm text-rose-600">{errors.amount_type}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            value={data.notes}
                            onChange={(event) => setData('notes', event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                            rows="4"
                        />
                        {errors.notes && <p className="mt-1 text-sm text-rose-600">{errors.notes}</p>}
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Conversion'}
                    </Button>
                </form>
            </Card>
        </AdminLayout>
    );
}
