import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Form from './Form';

export default function Create({ statuses }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        business_type: '',
        website_url: '',
        status: 'active',
        logo: null,
    });

    const submit = (event) => {
        event.preventDefault();

        post('/admin/brands', {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="New Brand"
                eyebrow="Admin"
                description="Create a reusable brand record that campaigns can be attached to."
            />

            <Form
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                statuses={statuses}
                onSubmit={submit}
                submitLabel="Create Brand"
            />
        </AdminLayout>
    );
}
