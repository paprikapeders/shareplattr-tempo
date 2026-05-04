import { useForm } from '@inertiajs/react';
import BusinessLayout from '../../../Layouts/BusinessLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import FileUpload from '../../../Components/FileUpload';
import Input from '../../../Components/Input';
import PageHeader from '../../../Components/PageHeader';

export default function Edit({ profile }) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: profile.company_name ?? '',
        contact_person_name: profile.contact_person_name ?? '',
        website_url: profile.website_url ?? '',
        phone: profile.phone ?? '',
        industry: profile.industry ?? '',
        description: profile.description ?? '',
        logo: null,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/business/profile', { forceFormData: true });
    };

    return (
        <BusinessLayout>
            <PageHeader title="Business Profile" eyebrow="Business" description="Complete the company details used for your campaigns." />

            <Card className="max-w-3xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Company Name</label>
                            <Input value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} className="mt-1" />
                            {errors.company_name && <p className="mt-1 text-sm text-rose-600">{errors.company_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Contact Person</label>
                            <Input value={data.contact_person_name} onChange={(event) => setData('contact_person_name', event.target.value)} className="mt-1" />
                            {errors.contact_person_name && <p className="mt-1 text-sm text-rose-600">{errors.contact_person_name}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Website</label>
                            <Input type="url" value={data.website_url} onChange={(event) => setData('website_url', event.target.value)} className="mt-1" />
                            {errors.website_url && <p className="mt-1 text-sm text-rose-600">{errors.website_url}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone</label>
                            <Input value={data.phone} onChange={(event) => setData('phone', event.target.value)} className="mt-1" />
                            {errors.phone && <p className="mt-1 text-sm text-rose-600">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Industry</label>
                            <Input value={data.industry} onChange={(event) => setData('industry', event.target.value)} className="mt-1" />
                            {errors.industry && <p className="mt-1 text-sm text-rose-600">{errors.industry}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea value={data.description} onChange={(event) => setData('description', event.target.value)} rows="4" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
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
        </BusinessLayout>
    );
}
