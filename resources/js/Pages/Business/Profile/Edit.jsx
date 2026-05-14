import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import BusinessSetupChecklist from '../../../Components/BusinessSetupChecklist';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import CharacterCounter from '../../../Components/CharacterCounter';
import FieldLabel from '../../../Components/FieldLabel';
import FileUpload from '../../../Components/FileUpload';
import Input from '../../../Components/Input';
import PageHeader from '../../../Components/PageHeader';
import SearchableSelect from '../../../Components/SearchableSelect';
import { clearFieldError, isBlank, scrollToField } from '../../../Support/formValidation';
import { INDUSTRY_OPTIONS, OTHER_KEY } from '../../../Support/taxonomy';

export default function Edit({ profile, setupChecklist }) {
    const { data, setData, post, processing, errors: serverErrors, clearErrors } = useForm({
        company_name: profile.company_name ?? '',
        contact_person_name: profile.contact_person_name ?? '',
        website_url: profile.website_url ?? '',
        phone: profile.phone ?? '',
        industry_key: profile.industry_key ?? '',
        industry_other: profile.industry_other ?? '',
        description: profile.description ?? '',
        logo: null,
    });
    const [clientErrors, setClientErrors] = useState({});
    const errors = { ...serverErrors, ...clientErrors };

    const updateField = (field, value) => {
        setData(field, value);
        clearErrors(field);
        setClientErrors((current) => {
            const next = clearFieldError(current, field);

            if (!current[field] || !['company_name', 'contact_person_name', 'industry_key', 'industry_other'].includes(field) || !isBlank(value)) {
                return next;
            }

            return { ...next, [field]: current[field] };
        });
    };

    const validate = () => {
        const nextErrors = {};

        if (isBlank(data.company_name)) {
            nextErrors.company_name = 'Company Name is required.';
        }

        if (isBlank(data.contact_person_name)) {
            nextErrors.contact_person_name = 'Contact Person is required.';
        }

        if (isBlank(data.industry_key)) {
            nextErrors.industry_key = 'Industry is required.';
        } else if (data.industry_key === OTHER_KEY && isBlank(data.industry_other)) {
            nextErrors.industry_other = 'Industry is required.';
        }

        setClientErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            scrollToField(Object.keys(nextErrors)[0]);
            return false;
        }

        return true;
    };

    const submit = (event) => {
        event.preventDefault();
        if (!validate()) {
            return;
        }

        post('/business/profile', { forceFormData: true });
    };

    return (
        <BusinessLayout>
            <PageHeader title="Business Profile" eyebrow="Business" description="Complete the company details used for your campaigns." />

            <div className="space-y-6">
            <BusinessSetupChecklist checklist={setupChecklist} />

            <Card className="max-w-3xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <FieldLabel required>Company Name</FieldLabel>
                            <Input name="company_name" value={data.company_name} onChange={(event) => updateField('company_name', event.target.value)} error={Boolean(errors.company_name)} className="mt-1" />
                            {errors.company_name && <p className="mt-1 text-sm text-rose-600">{errors.company_name}</p>}
                        </div>
                        <div>
                            <FieldLabel required>Contact Person</FieldLabel>
                            <Input name="contact_person_name" value={data.contact_person_name} onChange={(event) => updateField('contact_person_name', event.target.value)} error={Boolean(errors.contact_person_name)} className="mt-1" />
                            {errors.contact_person_name && <p className="mt-1 text-sm text-rose-600">{errors.contact_person_name}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <FieldLabel>Website</FieldLabel>
                            <Input name="website_url" type="url" value={data.website_url} onChange={(event) => updateField('website_url', event.target.value)} error={Boolean(errors.website_url)} className="mt-1" />
                            {errors.website_url && <p className="mt-1 text-sm text-rose-600">{errors.website_url}</p>}
                        </div>
                        <div>
                            <FieldLabel>Phone</FieldLabel>
                            <Input name="phone" value={data.phone} onChange={(event) => updateField('phone', event.target.value)} error={Boolean(errors.phone)} className="mt-1" />
                            {errors.phone && <p className="mt-1 text-sm text-rose-600">{errors.phone}</p>}
                        </div>
                        <div>
                            <FieldLabel required>Industry</FieldLabel>
                            <SearchableSelect
                                name="industry_key"
                                value={data.industry_key}
                                onChange={(value) => {
                                    updateField('industry_key', value);
                                    if (value !== OTHER_KEY) {
                                        updateField('industry_other', '');
                                    }
                                }}
                                options={INDUSTRY_OPTIONS}
                                placeholder="Search industry"
                                error={Boolean(errors.industry_key)}
                                className="mt-1"
                            />
                            {errors.industry_key && <p className="mt-1 text-sm text-rose-600">{errors.industry_key}</p>}
                            {data.industry_key === OTHER_KEY && (
                                <div className="mt-3">
                                    <Input
                                        name="industry_other"
                                        value={data.industry_other}
                                        onChange={(event) => updateField('industry_other', event.target.value)}
                                        error={Boolean(errors.industry_other)}
                                        placeholder="Enter industry"
                                    />
                                    {errors.industry_other && <p className="mt-1 text-sm text-rose-600">{errors.industry_other}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea name="description" value={data.description} onChange={(event) => updateField('description', event.target.value)} maxLength={300} rows="4" className={`mt-1 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:ring-4 ${errors.description ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'}`} aria-invalid={errors.description ? 'true' : undefined} />
                        <CharacterCounter value={data.description} max={300} />
                        {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
                    </div>

                    <div>
                        <FileUpload
                            label="Logo"
                            name="logo"
                            currentImageUrl={profile.logo_url}
                            currentImageLabel="Current logo"
                            onChange={(file) => setData('logo', file)}
                            error={errors.logo}
                        />
                    </div>

                    <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Profile'}</Button>
                </form>
            </Card>
            </div>
        </BusinessLayout>
    );
}
