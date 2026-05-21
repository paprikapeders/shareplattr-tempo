import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampaignPreviewModal from '../../../Components/CampaignPreview';
import PageHeader from '../../../Components/PageHeader';
import { clearFieldError, isBlank, scrollToField } from '../../../Support/formValidation';
import { OTHER_KEY } from '../../../Support/taxonomy';
import Form from './Form';

export default function Create({ statuses, brands }) {
    const { data, setData, post, processing, errors: serverErrors, clearErrors } = useForm({
        brand_id: '',
        title: '',
        description: '',
        category_key: '',
        category_other: '',
        reward_amount: '',
        commission_details: '',
        cookie_duration: '',
        network_platform: '',
        payout_details: '',
        requirements: '',
        deliverables: '',
        participant_instructions: '',
        share_message_template: '',
        campaign_terms: '',
        destination_url: '',
        campaign_banner: null,
        campaign_banner_url: null,
        status: 'active',
        expires_at: '',
    });
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [clientErrors, setClientErrors] = useState({});
    const errors = { ...serverErrors, ...clientErrors };
    const selectedBrand = brands.find((brand) => String(brand.id) === String(data.brand_id));

    const updateField = (field, value) => {
        setData(field, value);
        clearErrors(field);
        setClientErrors((current) => clearFieldError(current, field));
    };

    const validate = () => {
        const nextErrors = {};

        if (isBlank(data.brand_id)) {
            nextErrors.brand_id = 'Brand is required.';
        }

        if (isBlank(data.title)) {
            nextErrors.title = 'Campaign Title is required.';
        }

        if (isBlank(data.description)) {
            nextErrors.description = 'Description is required.';
        }

        if (isBlank(data.category_key)) {
            nextErrors.category_key = 'Category is required.';
        } else if (data.category_key === OTHER_KEY && isBlank(data.category_other)) {
            nextErrors.category_other = 'Category is required.';
        }

        if (isBlank(data.reward_amount)) {
            nextErrors.reward_amount = 'Reward Amount is required.';
        }

        if (isBlank(data.destination_url)) {
            nextErrors.destination_url = 'Destination URL is required.';
        }

        if (isBlank(data.status)) {
            nextErrors.status = 'Status is required.';
        }

        setClientErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            scrollToField(Object.keys(nextErrors)[0]);
            return false;
        }

        return true;
    };

    const preview = (event) => {
        event.preventDefault();
        if (!validate()) {
            return;
        }

        setIsPreviewOpen(true);
    };

    const submit = () => {
        if (processing) {
            return;
        }

        post('/admin/campaigns', {
            forceFormData: true,
            onError: () => {
                setIsPreviewOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
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
                setData={updateField}
                errors={errors}
                processing={processing}
                statuses={statuses}
                brands={brands}
                onSubmit={preview}
                submitLabel="Preview campaign"
            />
            <CampaignPreviewModal
                data={{ ...data, reward_type: 'flat' }}
                brand={selectedBrand}
                isOpen={isPreviewOpen}
                processing={processing}
                onClose={() => setIsPreviewOpen(false)}
                onConfirm={submit}
            />
        </AdminLayout>
    );
}
