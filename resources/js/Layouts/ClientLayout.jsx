import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '../Components/FlashMessages';

function LogoIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path d="M4.8 10.8c0-1.8 1-3.4 2.5-4.3l8-4.6c2.6-1.5 5.9.4 5.9 3.4v13.4c0 3-3.3 4.9-5.9 3.4l-8-4.6a5 5 0 0 1-2.5-4.3v-2.4Z" />
        </svg>
    );
}

function DashboardIconGrid() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="4" y="4" width="6" height="6" rx="1.5" />
            <rect x="14" y="4" width="6" height="6" rx="1.5" />
            <rect x="4" y="14" width="6" height="6" rx="1.5" />
            <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
    );
}

function DashboardIconCampaigns() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="M7 9h10M7 13h6" />
        </svg>
    );
}

function DashboardIconWallet() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="3" y="6" width="18" height="13" rx="3" />
            <path d="M16 12h5" />
            <circle cx="16" cy="12" r="1" fill="currentColor" />
            <path d="M6 6V5a2 2 0 0 1 2-2h9" />
        </svg>
    );
}

function DashboardIconReferrals() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <circle cx="8" cy="8" r="3" />
            <circle cx="17" cy="16" r="3" />
            <path d="M10.7 9.5l3.6 4" />
            <path d="M5.5 14.5a3.8 3.8 0 0 0-2 3.4V19h6" />
        </svg>
    );
}

function DashboardIconLogout() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M10 17v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
            <path d="M15 16l5-4-5-4" />
            <path d="M20 12H9" />
        </svg>
    );
}

function DashboardIconTheme() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    );
}

function DashboardIconBell() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M15 17H5l1.6-2.2a4 4 0 0 0 .7-2.3V10a4.7 4.7 0 1 1 9.4 0v2.5c0 .8.2 1.6.7 2.3L19 17h-4Z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
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

function navItemClasses(active) {
    return [
        'flex h-12 w-12 items-center justify-center rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-[#26338c]/25',
        active ? 'bg-[#eef2ff] text-[#26338c] shadow-sm shadow-[#26338c]/10' : 'text-slate-400 hover:bg-slate-50 hover:text-[#26338c]',
    ].join(' ');
}

function topbarNavClasses(active) {
    return [
        'rounded-full px-3.5 py-2 text-sm font-semibold transition',
        active ? 'bg-[#eef2ff] text-[#26338c]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ');
}

function getInitials(name = '') {
    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('');

    return initials || 'SP';
}

function SidebarContent({ url, onNavigate = () => {} }) {
    const items = [
        { href: '/dashboard', label: 'Dashboard', active: url?.startsWith('/dashboard'), icon: DashboardIconGrid },
        { href: '/campaigns', label: 'Campaigns', active: url?.startsWith('/campaigns'), icon: DashboardIconCampaigns },
        { href: '/dashboard#referrals', label: 'Referrals', active: url === '/dashboard#referrals', icon: DashboardIconReferrals },
        { href: '/payouts', label: 'Payouts', active: url?.startsWith('/payouts'), icon: DashboardIconWallet },
    ];

    return (
        <div className="flex h-full flex-col">
            <Link href="/dashboard" className="flex justify-center rounded-2xl text-[#26338c]" onClick={onNavigate} aria-label="SharePlattr dashboard" title="SharePlattr">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                    <LogoIcon />
                </span>
            </Link>

            <nav className="mt-7 flex flex-1 flex-col items-center gap-2">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={navItemClasses(item.active)}
                            onClick={onNavigate}
                            aria-label={item.label}
                            title={item.label}
                        >
                            <Icon />
                        </Link>
                    );
                })}
            </nav>

            <Link
                href="/logout"
                method="post"
                as="button"
                className="mt-6 flex h-12 w-12 items-center justify-center self-center rounded-2xl text-slate-400 transition hover:bg-slate-50 hover:text-[#26338c] focus:outline-none focus:ring-2 focus:ring-[#26338c]/25"
                aria-label="Logout"
                title="Logout"
            >
                <DashboardIconLogout />
            </Link>
        </div>
    );
}

function ClientTopBar({ url, user }) {
    const navItems = [
        { href: '/dashboard', label: 'Dashboard', active: url?.startsWith('/dashboard') },
        { href: '/campaigns', label: 'Campaigns', active: url?.startsWith('/campaigns') },
        { href: '/payouts', label: 'Payouts', active: url?.startsWith('/payouts') },
    ];
    const name = user?.name || 'SharePlattr user';

    return (
        <div className="rounded-[24px] bg-white px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70 sm:px-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <nav className="flex min-w-0 flex-wrap items-center gap-1.5" aria-label="Dashboard sections">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={topbarNavClasses(item.active)}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center gap-2 text-[#26338c]">
                        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-2xl transition hover:bg-slate-100" aria-label="Toggle theme" title="Theme">
                            <DashboardIconTheme />
                        </button>
                        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-2xl transition hover:bg-slate-100" aria-label="Notifications" title="Notifications">
                            <DashboardIconBell />
                        </button>
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f7ba7d_0%,#ff8a7c_100%)] text-sm font-bold uppercase text-white">
                            {getInitials(name)}
                        </div>
                        <div className="min-w-0 leading-tight">
                            <p className="text-xs text-slate-500">Welcome back,</p>
                            <p className="truncate text-[15px] font-semibold text-[#293249]">{name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ClientLayout({ children }) {
    const page = usePage();
    const { auth = {} } = page.props;
    const url = page.url;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                    <Link href="/dashboard" className="flex items-center gap-3 text-[#26338c]">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_16px_35px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
                            <LogoIcon />
                        </span>
                        <span className="text-lg font-semibold text-slate-900">SharePlattr</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileOpen((current) => !current)}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-[0_16px_35px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70"
                    >
                        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="mb-4 rounded-[28px] bg-white p-4 shadow-[0_22px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 lg:hidden">
                        <SidebarContent url={url} onNavigate={() => setMobileOpen(false)} />
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-5">
                    <aside className="hidden lg:block">
                        <div className="sticky top-5 flex min-h-[calc(100vh-40px)] flex-col rounded-[28px] bg-white px-2 py-5 shadow-[0_22px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
                            <SidebarContent url={url} />
                        </div>
                    </aside>

                    <main className="space-y-4 lg:space-y-5">
                        <ClientTopBar url={url} user={auth.user} />
                        <FlashMessages />
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
