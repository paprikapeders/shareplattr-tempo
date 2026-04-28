import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Form from './Form';

export default function Create({ statuses, brands }) {
    const { data, setData, post, processing, errors } = useForm({
        brand_id: '',
        title: '',
        description: '',
        category: '',
        reward_amount: '',
        destination_url: '',
        campaign_banner: null,
        campaign_banner_url: null,
        status: 'active',
        expires_at: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/admin/campaigns', {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="New Campaign"
                eyebrow="Admin"
                description="Create a campaign participants can browse and generate referral links for."
            />

            <Form
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                statuses={statuses}
                brands={brands}
                onSubmit={submit}
                submitLabel="Create Campaign"
            />
        </AdminLayout>
    );
}
