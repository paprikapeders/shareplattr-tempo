import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/Button';
import Card from '../../../Components/Card';
import EmptyState from '../../../Components/EmptyState';
import PageHeader from '../../../Components/PageHeader';

function statusClasses(status) {
    const classes = {
        active: 'bg-emerald-50 text-emerald-700',
        inactive: 'bg-slate-100 text-slate-700',
    };

    return classes[status] ?? classes.inactive;
}

export default function Index({ brands }) {
    const removeBrand = (brand) => {
        if (!window.confirm(`Delete or archive "${brand.name}"?`)) {
            return;
        }

        router.delete(`/admin/brands/${brand.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Brands"
                eyebrow="Admin"
                description="Manage the brand records used by campaigns across the MVP."
            >
                <Button as={Link} href="/admin/brands/create">
                    New Brand
                </Button>
            </PageHeader>

            {brands.length === 0 ? (
                <EmptyState title="No brands yet.">Create a brand before attaching it to campaigns.</EmptyState>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Brand</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Business Type</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate-500">Campaigns</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {brands.map((brand) => (
                                    <tr key={brand.id} className="transition hover:bg-slate-50/80">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {brand.logo_url ? (
                                                    <img src={brand.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">
                                                        {brand.name[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-950">{brand.name}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{brand.website_url ?? 'No website saved'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{brand.business_type ?? 'Not set'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(brand.status)}`}>
                                                {brand.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right text-sm text-slate-700">{brand.campaigns_count}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button as={Link} href={`/admin/brands/${brand.id}`} variant="secondary">
                                                    View
                                                </Button>
                                                <Button as={Link} href={`/admin/brands/${brand.id}/edit`} variant="secondary">
                                                    Edit
                                                </Button>
                                                <Button type="button" variant="subtle" onClick={() => removeBrand(brand)}>
                                                    Delete / Archive
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AdminLayout>
    );
}
