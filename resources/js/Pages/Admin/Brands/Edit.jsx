import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Form from './Form';

export default function Edit({ brand, statuses }) {
    const { data, setData, post, processing, errors } = useForm({
        name: brand.name,
        description: brand.description ?? '',
        business_type: brand.business_type ?? '',
        country_region: brand.country_region ?? '',
        website_url: brand.website_url ?? '',
        domain: brand.domain ?? '',
        affiliate_url: brand.affiliate_url ?? '',
        logo_url: brand.external_logo_url ?? '',
        contact_info: brand.contact_info ?? '',
        notes: brand.notes ?? '',
        status: brand.status,
        logo: null,
        _method: 'put',
    });

    const submit = (event) => {
        event.preventDefault();

        post(`/admin/brands/${brand.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Edit Brand"
                eyebrow="Admin"
                description="Update the brand details shown alongside connected campaigns."
            />

            <Form
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                statuses={statuses}
                onSubmit={submit}
                submitLabel="Update Brand"
                logoUrl={brand.logo_url}
            />
        </AdminLayout>
    );
}
