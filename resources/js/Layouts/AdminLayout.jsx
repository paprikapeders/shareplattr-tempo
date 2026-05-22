import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BrandLogo, { BrandMark } from '../Components/BrandLogo';
import FlashMessages from '../Components/FlashMessages';
import MobileNavDrawer from '../Components/MobileNavDrawer';

function LogoMark() {
    return <BrandMark className="h-9 w-9 shrink-0" />;
}

function MenuIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function NavIcon({ children }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            {children}
        </svg>
    );
}

const adminIcons = {
    brands: () => <NavIcon><path d="M5 7h14v12H5z" /><path d="M8 7V5h8v2M8 11h8M8 15h5" /></NavIcon>,
    campaigns: () => <NavIcon><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 9h8M8 13h6" /></NavIcon>,
    imports: () => <NavIcon><path d="M12 4v10" /><path d="m8 10 4 4 4-4" /><path d="M5 20h14" /></NavIcon>,
    conversions: () => <NavIcon><path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" /></NavIcon>,
    waitlist: () => <NavIcon><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M17 8h4M19 6v4" /></NavIcon>,
    payouts: () => <NavIcon><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M16 12h5" /><circle cx="16" cy="12" r="1" fill="currentColor" /></NavIcon>,
    activity: () => <NavIcon><path d="M4 12h4l2-6 4 12 2-6h4" /></NavIcon>,
    logout: () => <NavIcon><path d="M10 17v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" /><path d="M15 16l5-4-5-4M20 12H9" /></NavIcon>,
};

function navClasses(active) {
    return [
        'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition',
        active
            ? 'bg-slate-950 text-white shadow-sm shadow-slate-950/10'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    ].join(' ');
}

function getAdminPageTitle(url) {
    if (url?.startsWith('/admin/brands')) {
        return 'Brands';
    }

    if (url?.startsWith('/admin/campaigns')) {
        return 'Campaigns';
    }

    if (url?.startsWith('/admin/imports')) {
        return 'Bulk Imports';
    }

    if (url?.startsWith('/admin/conversions')) {
        return 'Record Conversion';
    }

    if (url?.startsWith('/admin/waitlist')) {
        return 'Waitlist';
    }

    if (url?.startsWith('/admin/payout-requests')) {
        return 'Payout Requests';
    }

    if (url?.startsWith('/admin/activity')) {
        return 'Activity';
    }

    return 'Admin Panel';
}

function AdminSidebar({ url, onNavigate = () => {}, showBrand = true, dark = false }) {
    const sections = [
        {
            title: 'Campaigns',
            items: [
                { href: '/admin/brands', label: 'Brands', active: url?.startsWith('/admin/brands'), icon: adminIcons.brands },
                { href: '/admin/campaigns', label: 'Campaigns', active: url?.startsWith('/admin/campaigns'), icon: adminIcons.campaigns },
                { href: '/admin/imports', label: 'Bulk Imports', active: url?.startsWith('/admin/imports'), icon: adminIcons.imports },
                { href: '/admin/conversions/create', label: 'Record Conversion', active: url?.startsWith('/admin/conversions'), icon: adminIcons.conversions },
            ],
        },
        {
            title: 'Growth',
            items: [
                { href: '/admin/waitlist', label: 'Waitlist', active: url?.startsWith('/admin/waitlist'), icon: adminIcons.waitlist },
            ],
        },
        {
            title: 'Payouts',
            items: [
                { href: '/admin/payout-requests', label: 'Payout Requests', active: url?.startsWith('/admin/payout-requests'), icon: adminIcons.payouts },
            ],
        },
        {
            title: 'Monitoring',
            items: [
                { href: '/admin/activity', label: 'Activity', active: url?.startsWith('/admin/activity'), icon: adminIcons.activity },
            ],
        },
    ];

    return (
        <div className="flex h-full flex-col">
            {showBrand && (
                <Link href="/admin/campaigns" className="flex items-center gap-3 px-1 text-slate-950" onClick={onNavigate}>
                    <BrandLogo className="h-9 w-auto max-w-[170px]" />
                    <div className="leading-tight">
                        <p className="text-xs font-medium text-slate-500">Admin</p>
                    </div>
                </Link>
            )}

            <nav className={`${showBrand ? 'mt-8' : ''} flex-1 space-y-7`} aria-label="Admin navigation">
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className={`px-3 text-xs font-semibold uppercase tracking-[0.16em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {section.title}
                        </p>
                        <div className="mt-2 space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={dark ? [
                                            'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                                            item.active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                        ].join(' ') : navClasses(item.active)}
                                        onClick={onNavigate}
                                    >
                                        <Icon />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className={`${dark ? 'border-slate-800' : 'border-slate-200'} border-t pt-4`}>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className={dark ? 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white' : 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950'}
                >
                    {adminIcons.logout()}
                    <span>Logout</span>
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
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pageTitle = getAdminPageTitle(url);

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
            <aside className="hidden border-r border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:h-screen lg:w-[260px] lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 py-6">
                    <AdminSidebar url={url} />
                </div>
            </aside>

            <div className="min-w-0 overflow-x-hidden lg:pl-[260px]">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(true)}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden"
                                    aria-label="Open admin navigation"
                                >
                                    <MenuIcon />
                                </button>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-950">{pageTitle}</p>
                                    <p className="truncate text-xs text-slate-500">Admin Panel</p>
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen((current) => !current)}
                                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 text-xs font-medium text-slate-500 shadow-sm shadow-slate-950/5 transition hover:bg-white sm:pr-3"
                                    aria-label="Open user menu"
                                    aria-haspopup="menu"
                                    aria-expanded={userMenuOpen}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                                        {(auth.user?.name || 'A').slice(0, 1).toUpperCase()}
                                    </span>
                                    <span className="hidden max-w-36 truncate sm:inline">
                                        {auth.user?.name || 'Admin'}
                                    </span>
                                    <span className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}>
                                        <ChevronDownIcon />
                                    </span>
                                </button>

                                {userMenuOpen && (
                                    <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-950/10">
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            role="menuitem"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                                        >
                                            {adminIcons.logout()}
                                            Logout
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                </header>

                <MobileNavDrawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    title="SharePlattr"
                    subtitle="Admin"
                    homeHref="/admin/campaigns"
                    logo={<LogoMark />}
                    navLabel="Admin navigation"
                >
                    <AdminSidebar url={url} onNavigate={() => setMobileOpen(false)} showBrand={false} dark />
                </MobileNavDrawer>

                <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full max-w-7xl space-y-6">
                        <FlashMessages />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
