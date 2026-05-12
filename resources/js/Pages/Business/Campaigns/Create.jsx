import { useForm } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import PageHeader from '../../../Components/PageHeader';
import Form from './Form';

export default function Create({ statuses }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: '',
        reward_type: 'flat',
        reward_amount: '',
        destination_url: '',
        campaign_banner: null,
        campaign_banner_url: null,
        status: 'draft',
        expires_at: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/business/campaigns', { forceFormData: true });
    };

    return (
        <BusinessLayout>
            <PageHeader title="New Campaign" eyebrow="Business" description="Create a campaign for participants to promote." />
            <Form data={data} setData={setData} errors={errors} processing={processing} statuses={statuses} onSubmit={submit} submitLabel="Create Campaign" />
        </BusinessLayout>
    );
}
