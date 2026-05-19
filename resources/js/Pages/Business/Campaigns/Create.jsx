import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import CampaignDraftPreview from '../../../Components/CampaignDraftPreview';
import PageHeader from '../../../Components/PageHeader';
import { clearFieldError, isBlank, scrollToField } from '../../../Support/formValidation';
import { OTHER_KEY } from '../../../Support/taxonomy';
import Form from './Form';

function StepIndicator({ step }) {
    return (
        <div className="mb-5 flex max-w-3xl items-center gap-3 text-sm font-semibold">
            <span className={`rounded-full px-3 py-1 ${step === 'details' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500'}`}>Step 1: Details</span>
            <span className="h-px flex-1 bg-slate-200" />
            <span className={`rounded-full px-3 py-1 ${step === 'preview' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500'}`}>Step 2: Preview</span>
        </div>
    );
}

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
    const [step, setStep] = useState('details');
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

        setStep('preview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = () => {
        if (processing) {
            return;
        }

        post('/business/campaigns', {
            forceFormData: true,
            onError: () => {
                setStep('details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    return (
        <BusinessLayout>
            <PageHeader title="Create Campaign" eyebrow="Business" description="Create a campaign for participants to promote." />
            <StepIndicator step={step} />
            {step === 'details' ? (
                <Form data={data} setData={updateField} errors={errors} processing={processing} statuses={statuses} onSubmit={preview} submitLabel="Preview campaign" />
            ) : (
                <CampaignDraftPreview
                    data={data}
                    brand={brand}
                    processing={processing}
                    onEdit={() => setStep('details')}
                    onConfirm={submit}
                />
            )}
        </BusinessLayout>
    );
}
