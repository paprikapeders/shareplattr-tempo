import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import CampaignPreviewModal from '../../../Components/CampaignPreview';
import PageHeader from '../../../Components/PageHeader';
import { clearFieldError, isBlank, scrollToField } from '../../../Support/formValidation';
import { OTHER_KEY } from '../../../Support/taxonomy';
import Form from './Form';

export default function Create({ statuses, brand }) {
    const { data, setData, post, processing, errors: serverErrors, clearErrors } = useForm({
        title: '',
        description: '',
        category_key: '',
        category_other: '',
        reward_type: 'flat',
        reward_amount: '',
        destination_url: '',
        share_message_template: '',
        campaign_terms: '',
        campaign_banner: null,
        campaign_banner_url: null,
        status: 'draft',
        expires_at: '',
    });
    const [clientErrors, setClientErrors] = useState({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const errors = { ...serverErrors, ...clientErrors };

    const updateField = (field, value) => {
        setData(field, value);
        clearErrors(field);
        setClientErrors((current) => {
            const next = clearFieldError(current, field);

            if (
                !current[field]
                || !['title', 'description', 'category_key', 'category_other', 'reward_type', 'reward_amount', 'destination_url', 'status'].includes(field)
                || !isBlank(value)
            ) {
                return next;
            }

            return { ...next, [field]: current[field] };
        });
    };

    const validate = () => {
        const nextErrors = {};

        if (isBlank(data.title)) {
            nextErrors.title = 'Campaign Title is required.';
        }

        if (isBlank(data.category_key)) {
            nextErrors.category_key = 'Category is required.';
        } else if (data.category_key === OTHER_KEY && isBlank(data.category_other)) {
            nextErrors.category_other = 'Category is required.';
        }

        if (isBlank(data.description)) {
            nextErrors.description = 'Description is required.';
        }

        if (isBlank(data.reward_type)) {
            nextErrors.reward_type = 'Reward Type is required.';
        }

        if (isBlank(data.reward_amount)) {
            nextErrors.reward_amount = 'Reward Amount is required.';
        }

        if (isBlank(data.status)) {
            nextErrors.status = 'Status is required.';
        }

        if (isBlank(data.destination_url)) {
            nextErrors.destination_url = 'Destination URL is required.';
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

        post('/business/campaigns', {
            forceFormData: true,
            onError: () => {
                setIsPreviewOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    return (
        <BusinessLayout>
            <PageHeader title="Create Campaign" eyebrow="Business" description="Create a campaign for participants to promote." />
            <Form data={data} setData={updateField} errors={errors} processing={processing} statuses={statuses} onSubmit={preview} submitLabel="Preview campaign" />
            <CampaignPreviewModal
                data={data}
                brand={brand}
                isOpen={isPreviewOpen}
                processing={processing}
                onClose={() => setIsPreviewOpen(false)}
                onConfirm={submit}
            />
        </BusinessLayout>
    );
}
