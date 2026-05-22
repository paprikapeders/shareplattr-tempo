import { useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import Card from '../../Components/Card';
import FieldLabel from '../../Components/FieldLabel';
import Input from '../../Components/Input';
import PageHeader from '../../Components/PageHeader';
import ClientLayout from '../../Layouts/ClientLayout';

export default function Edit({ profile }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: profile.name ?? '',
    });

    const updateName = (value) => {
        setData('name', value);
        clearErrors('name');
    };

    const submit = (event) => {
        event.preventDefault();
        post('/profile');
    };

    return (
        <ClientLayout>
            <PageHeader title="Profile" eyebrow="Participant" description="Update the name shown on your participant account." />

            <Card className="max-w-2xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <FieldLabel required>Name</FieldLabel>
                        <Input
                            name="name"
                            value={data.name}
                            onChange={(event) => updateName(event.target.value)}
                            error={Boolean(errors.name)}
                            className="mt-1"
                            autoComplete="name"
                        />
                        {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
                    </div>

                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <Input value={profile.email ?? ''} className="mt-1" disabled />
                    </div>

                    <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Profile'}</Button>
                </form>
            </Card>
        </ClientLayout>
    );
}
