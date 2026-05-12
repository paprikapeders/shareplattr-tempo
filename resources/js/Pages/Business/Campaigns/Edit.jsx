import { useForm } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import PageHeader from '../../../Components/PageHeader';
import Form from './Form';

export default function Edit({ campaign, statuses }) {
    const { data, setData, post, processing, errors } = useForm({
        title: campaign.title,
        description: campaign.description ?? '',
        category: campaign.category ?? '',
        reward_type: campaign.reward_type ?? 'flat',
        reward_amount: campaign.reward_amount_dollars,
        destination_url: campaign.destination_url,
        campaign_banner: null,
        campaign_banner_url: campaign.campaign_banner_url,
        status: campaign.status,
        expires_at: campaign.expires_at ?? '',
        _method: 'put',
    });

    const submit = (event) => {
        event.preventDefault();
        post(`/business/campaigns/${campaign.id}`, { forceFormData: true });
    };

    return (
        <BusinessLayout>
            <PageHeader title="Edit Campaign" eyebrow="Business" description="Update your campaign without changing existing performance totals." />
            <Form data={data} setData={setData} errors={errors} processing={processing} statuses={statuses} onSubmit={submit} submitLabel="Update Campaign" />
        </BusinessLayout>
    );
}
