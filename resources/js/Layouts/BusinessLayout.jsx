import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '../Components/FlashMessages';
import useSidebarPreference from '../Support/useSidebarPreference';

function IconMenu() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function IconPanelOpen() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="4" y="4" width="16" height="16" rx="2.5" />
            <path d="M9 4v16M14 9l3 3-3 3" />
        </svg>
    );
}

function IconPanelClose() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="4" y="4" width="16" height="16" rx="2.5" />
            <path d="M9 4v16M17 9l-3 3 3 3" />
        </svg>
    );
}

function IconGrid() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="4" y="4" width="6" height="6" rx="1.5" />
            <rect x="14" y="4" width="6" height="6" rx="1.5" />
            <rect x="4" y="14" width="6" height="6" rx="1.5" />
            <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
    );
}

function IconList() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="5" y="4" width="14" height="16" rx="2" />
            <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
    );
}

function IconBolt() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" />
        </svg>
    );
}

function IconProfile() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <circle cx="12" cy="8" r="4" />
            <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
    );
}

function IconWallet() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="3" y="6" width="18" height="13" rx="3" />
            <path d="M16 12h5" />
            <circle cx="16" cy="12" r="1" fill="currentColor" />
            <path d="M6 6V5a2 2 0 0 1 2-2h9" />
        </svg>
    );
}

function IconCard() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="M3 10h18M7 15h4" />
        </svg>
    );
}

function IconLogout() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M10 17v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
            <path d="M15 16l5-4-5-4M20 12H9" />
        </svg>
    );
}

function IconBag() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M6 8h12l-1 12H7L6 8Z" />
            <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
    );
}

function isActive(url, item) {
    if (item.href === '/business/campaigns') {
        return url === '/business/campaigns'
            || /^\/business\/campaigns\/\d+(\/stats|\/edit)?$/.test(url ?? '');
    }

    return url === item.href || Boolean(item.matchPrefix && url?.startsWith(item.matchPrefix));
}

function sidebarLinkClass(active, expanded, primary = false) {
    if (primary) {
        return [
            'group relative flex h-11 items-center rounded-xl text-sm font-semibold text-slate-950 shadow-sm shadow-cyan-950/15 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/40',
            expanded ? 'w-full justify-start gap-3 px-3 bg-cyan-400' : 'w-11 justify-center bg-cyan-400',
            active ? 'ring-2 ring-cyan-200/50' : '',
        ].join(' ');
    }

    return [
        'group relative flex h-11 items-center rounded-xl text-sm font-semibold transition',
        expanded ? 'w-full justify-start gap-3 px-3' : 'w-11 justify-center',
        active ? 'bg-slate-700 text-white shadow-sm shadow-black/10' : 'text-slate-500 hover:bg-slate-800 hover:text-white',
    ].join(' ');
}

function SidebarTooltip({ children }) {
    return (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
            {children}
        </span>
    );
}

function SidebarContent({ url, expanded, onToggle, onNavigate = () => {} }) {
    const items = [
        { href: '/business/dashboard', label: 'Dashboard', icon: IconGrid },
        { href: '/business/campaigns', label: 'Campaigns', icon: IconList },
        { href: '/business/campaigns/create', label: 'Create Campaign', icon: IconBolt, primary: true },
        { href: '/business/payout-requests', label: 'Payout Requests', icon: IconWallet, matchPrefix: '/business/payout-requests' },
        { href: '/business/billing', label: 'Billing', icon: IconCard, matchPrefix: '/business/billing' },
        { href: '/business/profile', label: 'Profile', icon: IconProfile, matchPrefix: '/business/profile' },
    ];
    const toggleLabel = expanded ? 'Collapse sidebar' : 'Expand sidebar';
    const ToggleIcon = expanded ? IconPanelClose : IconPanelOpen;

    return (
        <div className="flex h-full flex-col">
            <div className={`mb-5 flex items-center ${expanded ? 'justify-between gap-3' : 'justify-center'}`}>
                {expanded && (
                    <Link href="/business/dashboard" className="flex min-w-0 items-center gap-3 text-white" onClick={onNavigate}>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-sm font-bold text-slate-950">
                            S
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-bold">SharePlattr</span>
                            <span className="block truncate text-xs text-slate-400">Business</span>
                        </span>
                    </Link>
                )}

                <button
                    type="button"
                    onClick={onToggle}
                    className={[
                        'group relative flex h-9 shrink-0 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-800/70 text-slate-300 transition hover:border-cyan-400/50 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/35',
                        expanded ? 'gap-2 px-3 text-xs font-semibold' : 'w-9',
                    ].join(' ')}
                    aria-label={toggleLabel}
                    title={toggleLabel}
                >
                    <ToggleIcon />
                    {expanded && <span>Collapse</span>}
                    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
                        {toggleLabel}
                    </span>
                </button>
            </div>

            <nav className={`flex flex-1 flex-col gap-2 ${expanded ? 'items-stretch' : 'items-center'}`} aria-label="Business navigation">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(url, item);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={sidebarLinkClass(active, expanded, item.primary)}
                            title={expanded ? undefined : item.label}
                            aria-label={item.label}
                            onClick={onNavigate}
                        >
                            <Icon />
                            {expanded && <span className="truncate">{item.label}</span>}
                            {!expanded && <SidebarTooltip>{item.label}</SidebarTooltip>}
                        </Link>
                    );
                })}
            </nav>

            <Link
                href="/logout"
                method="post"
                as="button"
                className={[
                    'group relative mt-6 flex h-11 items-center rounded-xl text-sm font-semibold text-slate-500 transition hover:bg-slate-800 hover:text-white',
                    expanded ? 'w-full justify-start gap-3 px-3' : 'w-11 justify-center self-center',
                ].join(' ')}
                aria-label="Logout"
                title={expanded ? undefined : 'Logout'}
            >
                <IconLogout />
                {expanded && <span>Logout</span>}
                {!expanded && <SidebarTooltip>Logout</SidebarTooltip>}
            </Link>
        </div>
    );
}

function DesktopSidebar({ url, expanded, onToggle }) {
    return (
        <aside className={`fixed inset-y-0 left-0 z-40 hidden bg-slate-900 px-3 py-4 text-slate-500 transition-all duration-200 lg:block ${expanded ? 'w-56' : 'w-14'}`}>
            <SidebarContent url={url} expanded={expanded} onToggle={onToggle} />
        </aside>
    );
}

function MobileSidebar({ url, open, onClose }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-slate-950/40" onClick={onClose} aria-label="Close business navigation" />
            <aside className="relative h-full w-64 bg-slate-900 px-3 py-4 text-slate-500 shadow-xl">
                <SidebarContent url={url} expanded onToggle={onClose} onNavigate={onClose} />
            </aside>
        </div>
    );
}

function Header({ user, url, onMobileMenu }) {
    const dashboardActive = url === '/business/dashboard';

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="flex h-12 items-center justify-between px-5">
                <div className="flex h-full min-w-0 items-center gap-4 sm:gap-7">
                    <button
                        type="button"
                        onClick={onMobileMenu}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 lg:hidden"
                        aria-label="Open business navigation"
                    >
                        <IconMenu />
                    </button>
                    <Link
                        href="/business/dashboard"
                        className={[
                            'flex h-full items-center gap-2 border-b-2 px-1 text-sm font-bold transition',
                            dashboardActive
                                ? 'border-violet-600 text-slate-950'
                                : 'border-transparent text-slate-600 hover:text-slate-950',
                        ].join(' ')}
                    >
                        <IconBag />
                        Dashboard
                    </Link>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                        {(user?.name || 'B').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hidden text-left leading-tight sm:block">
                        <span className="block text-[10px] text-slate-400">Welcome back,</span>
                        <span className="block max-w-28 truncate text-xs font-semibold text-slate-950">{user?.name || 'Business'}</span>
                    </span>
                </div>
            </div>
        </header>
    );
}

export default function BusinessLayout({ children }) {
    const page = usePage();
    const { auth = {} } = page.props;
    const [expanded, setExpanded] = useSidebarPreference();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <DesktopSidebar url={page.url} expanded={expanded} onToggle={() => setExpanded((current) => !current)} />
            <MobileSidebar url={page.url} open={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className={`min-w-0 transition-all duration-200 ${expanded ? 'lg:pl-56' : 'lg:pl-14'}`}>
                <Header user={auth.user} url={page.url} onMobileMenu={() => setMobileOpen(true)} />
                <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
                    <FlashMessages className="mb-6" />
                    {children}
                </main>
            </div>
        </div>
    );
}
