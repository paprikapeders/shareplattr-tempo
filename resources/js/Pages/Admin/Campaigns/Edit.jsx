import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Form from './Form';

export default function Edit({ campaign, statuses, brands }) {
    const { data, setData, post, processing, errors } = useForm({
        brand_id: campaign.brand_id ? String(campaign.brand_id) : '',
        title: campaign.title,
        description: campaign.description ?? '',
        category: campaign.category ?? '',
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
        post(`/admin/campaigns/${campaign.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Edit Campaign"
                eyebrow="Admin"
                description="Update campaign details without changing existing click or conversion totals."
            />

            <Form
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                statuses={statuses}
                brands={brands}
                onSubmit={submit}
                submitLabel="Update Campaign"
            />
        </AdminLayout>
    );
}
