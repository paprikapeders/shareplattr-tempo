import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '../Components/FlashMessages';

function LogoMark() {
    return (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-sm shadow-slate-950/15">
            S
        </span>
    );
}

function MenuIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

function navClasses(active) {
    return [
        'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition',
        active
            ? 'bg-slate-950 text-white shadow-sm shadow-slate-950/10'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    ].join(' ');
}

function AdminSidebar({ url, onNavigate = () => {} }) {
    const sections = [
        {
            title: 'Campaigns',
            items: [
                { href: '/admin/campaigns', label: 'Campaigns', active: url?.startsWith('/admin/campaigns') },
                { href: '/admin/brands', label: 'Brands', active: url?.startsWith('/admin/brands') },
                { href: '/admin/conversions/create', label: 'Record Conversion', active: url?.startsWith('/admin/conversions') },
            ],
        },
        {
            title: 'Payouts',
            items: [
                { href: '/admin/rewards', label: 'Rewards', active: url?.startsWith('/admin/rewards') },
                { href: '/admin/payout-requests', label: 'Payout Requests', active: url?.startsWith('/admin/payout-requests') },
            ],
        },
        {
            title: 'Monitoring',
            items: [
                { href: '/admin/activity', label: 'Activity', active: url?.startsWith('/admin/activity') },
            ],
        },
    ];

    return (
        <div className="flex h-full flex-col">
            <Link href="/admin/campaigns" className="flex items-center gap-3 px-1 text-slate-950" onClick={onNavigate}>
                <LogoMark />
                <div className="leading-tight">
                    <p className="text-base font-bold">SharePlattr</p>
                    <p className="text-xs font-medium text-slate-500">Admin</p>
                </div>
            </Link>

            <nav className="mt-8 flex-1 space-y-7" aria-label="Admin navigation">
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {section.title}
                        </p>
                        <div className="mt-2 space-y-1">
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={navClasses(item.active)}
                                    onClick={onNavigate}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-200 pt-4">
                <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" onClick={onNavigate}>
                    Client Dashboard
                </Link>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                >
                    Logout
                </Link>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    const page = usePage();
    const { auth = {} } = page.props;
    const url = page.url;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="hidden border-r border-slate-200 bg-white lg:block">
                    <div className="sticky top-0 h-screen px-5 py-6">
                        <AdminSidebar url={url} />
                    </div>
                </aside>

                <div className="min-w-0">
                    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen((current) => !current)}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden"
                                    aria-label="Toggle admin navigation"
                                >
                                    {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                                </button>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-950">Admin Panel</p>
                                    <p className="truncate text-xs text-slate-500">Manage campaigns, brands, rewards, and payouts.</p>
                                </div>
                            </div>

                            {auth.user?.name && (
                                <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm shadow-slate-950/5 sm:block">
                                    Signed in as <span className="text-slate-800">{auth.user.name}</span>
                                </div>
                            )}
                        </div>
                    </header>

                    {mobileOpen && (
                        <div className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
                            <AdminSidebar url={url} onNavigate={() => setMobileOpen(false)} />
                        </div>
                    )}

                    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                        <div className="mx-auto w-full max-w-7xl space-y-6">
                            <FlashMessages />
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
