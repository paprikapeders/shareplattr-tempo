import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import BrandLogo, { BrandMark } from '../Components/BrandLogo';
import FlashMessages from '../Components/FlashMessages';
import MobileNavDrawer from '../Components/MobileNavDrawer';
import useSidebarPreference, { CLIENT_SIDEBAR_STORAGE_KEY } from '../Support/useSidebarPreference';

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
            <rect x="5" y="4" width="14" height="16" rx="2" />
            <path d="M8 4V2M16 4V2M8 9h8M8 13h5" />
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

function DashboardIconLogout() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M10 17v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
            <path d="M15 16l5-4-5-4" />
            <path d="M20 12H9" />
        </svg>
    );
}

function DashboardIconProfile() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <circle cx="12" cy="8" r="4" />
            <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <path d="m15 18-6-6 6-6" />
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

function MenuIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function getClientPageTitle(url) {
    if (url?.startsWith('/campaigns')) {
        return 'Campaign Marketplace';
    }

    if (url?.startsWith('/payouts')) {
        return 'Payouts';
    }

    return 'Dashboard';
}

function navItemClasses(active, collapsed) {
    return [
        'group relative flex h-10 items-center rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/25',
        collapsed ? 'w-10 justify-center' : 'w-full justify-start gap-3 px-3',
        active ? 'bg-slate-700 text-white shadow-sm shadow-black/10' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white',
    ].join(' ');
}

function SidebarTooltip({ children }) {
    return (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
            {children}
        </span>
    );
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

function SidebarContent({ url, collapsed, onToggle, onNavigate = () => {}, showBrand = true }) {
    const items = [
        { href: '/campaigns', label: 'Campaign Marketplace', active: url?.startsWith('/campaigns'), icon: DashboardIconCampaigns },
        { href: '/dashboard', label: 'Dashboard', active: url?.startsWith('/dashboard'), icon: DashboardIconGrid },
        { href: '/payouts', label: 'Payouts', active: url?.startsWith('/payouts'), icon: DashboardIconWallet },
    ];

    return (
        <div className="flex h-full flex-col">
            <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between gap-3'}`}>
                {showBrand && (
                    <Link href="/dashboard" className="flex min-w-0 items-center gap-3 text-white" onClick={onNavigate} aria-label="SharePlattr dashboard" title="SharePlattr">
                        {collapsed ? (
                            <BrandMark className="h-10 w-10 shrink-0" />
                        ) : (
                            <BrandLogo variant="white" className="h-9 w-auto max-w-[150px]" />
                        )}
                    </Link>
                )}

                <button
                    type="button"
                    onClick={onToggle}
                    className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white lg:flex"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
                        <ChevronLeftIcon />
                    </span>
                </button>
            </div>

            <nav className={`mt-7 flex flex-1 flex-col gap-2 ${collapsed ? 'items-center' : 'items-stretch'}`}>
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={navItemClasses(item.active, collapsed)}
                            onClick={onNavigate}
                            aria-label={item.label}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                            {collapsed && <SidebarTooltip>{item.label}</SidebarTooltip>}
                        </Link>
                    );
                })}
            </nav>

            <div className={`mt-6 flex ${collapsed ? 'justify-center' : 'justify-start'}`}>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className={navItemClasses(false, collapsed)}
                    aria-label="Logout"
                    title={collapsed ? 'Logout' : undefined}
                >
                    <DashboardIconLogout />
                    {!collapsed && <span>Logout</span>}
                    {collapsed && <SidebarTooltip>Logout</SidebarTooltip>}
                </Link>
            </div>
        </div>
    );
}

function ClientTopBar({ url, user, onMobileMenu }) {
    const name = user?.name || 'SharePlattr user';
    const pageTitle = getClientPageTitle(url);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) {
            return undefined;
        }

        function closeOnOutsideClick(event) {
            if (!menuRef.current?.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        function closeOnEscape(event) {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [menuOpen]);

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white px-4 py-3 shadow-sm sm:px-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                    <button
                        type="button"
                        onClick={onMobileMenu}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
                        aria-label="Open participant navigation"
                    >
                        <MenuIcon />
                    </button>

                    <div className="min-w-0 lg:hidden">
                        <p className="truncate text-sm font-semibold text-slate-950">{pageTitle}</p>
                    </div>
                </div>

                <div ref={menuRef} className="relative flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((current) => !current)}
                        onKeyDown={(event) => {
                            if (event.key === 'ArrowDown') {
                                event.preventDefault();
                                setMenuOpen(true);
                            }
                        }}
                        className="flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        aria-label="Open user menu"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400 text-sm font-bold uppercase text-white">
                            {getInitials(name)}
                        </div>
                        <div className="hidden min-w-0 text-left leading-tight sm:block">
                            <p className="text-[10px] text-slate-400">Welcome back,</p>
                            <p className="truncate text-xs font-semibold text-slate-950">{name}</p>
                        </div>
                        <span className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}>
                            <ChevronDownIcon />
                        </span>
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-950/10"
                        >
                            <Link
                                href="/profile"
                                role="menuitem"
                                onClick={() => setMenuOpen(false)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                            >
                                <DashboardIconProfile />
                                Profile
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                role="menuitem"
                                onClick={() => setMenuOpen(false)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                                <DashboardIconLogout />
                                Logout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function ClientLayout({ children }) {
    const page = usePage();
    const { auth = {} } = page.props;
    const url = page.url;
    const [sidebarExpanded, setSidebarExpanded] = useSidebarPreference(CLIENT_SIDEBAR_STORAGE_KEY);
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebarCollapsed = !sidebarExpanded;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">
            <aside className={`hidden bg-slate-900 transition-all duration-300 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:h-screen lg:flex-col ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-[220px]'}`}>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-5">
                    <SidebarContent
                        url={url}
                        collapsed={sidebarCollapsed}
                        onToggle={() => setSidebarExpanded((current) => !current)}
                    />
                </div>
            </aside>

            <MobileNavDrawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                title="SharePlattr"
                subtitle="Participant"
                homeHref="/dashboard"
                logo={<BrandMark className="h-10 w-10 shrink-0" />}
                navLabel="Participant navigation"
            >
                <SidebarContent
                    url={url}
                    collapsed={false}
                    onToggle={() => setMobileOpen(false)}
                    onNavigate={() => setMobileOpen(false)}
                    showBrand={false}
                />
            </MobileNavDrawer>

            <div className={`min-w-0 overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[220px]'}`}>
                <ClientTopBar url={url} user={auth.user} onMobileMenu={() => setMobileOpen(true)} />
                <main className="mx-auto min-h-screen w-full max-w-[1500px] space-y-5 overflow-x-hidden px-4 py-4 sm:px-6 lg:px-6 xl:px-8 lg:py-6">
                    <FlashMessages />
                    {children}
                </main>
            </div>
        </div>
    );
}
