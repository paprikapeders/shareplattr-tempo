import { Link } from '@inertiajs/react';

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

export default function MobileNavDrawer({
    open,
    onClose,
    title = 'SharePlattr',
    subtitle,
    homeHref,
    logo,
    children,
    navLabel = 'Mobile navigation',
}) {
    return (
        <div
            className={[
                'fixed inset-0 z-50 lg:hidden',
                open ? 'pointer-events-auto' : 'pointer-events-none',
            ].join(' ')}
            aria-hidden={!open}
        >
            <button
                type="button"
                className={[
                    'absolute inset-0 bg-slate-950/45 transition-opacity duration-200',
                    open ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                onClick={onClose}
                aria-label="Close navigation"
                tabIndex={open ? 0 : -1}
            />

            <aside
                className={[
                    'relative flex h-full w-[min(20rem,calc(100vw-2rem))] flex-col bg-slate-900 px-4 py-4 text-slate-300 shadow-2xl transition-transform duration-200',
                    open ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
                aria-label={navLabel}
            >
                <div className="flex items-center justify-between gap-3">
                    <Link href={homeHref} onClick={onClose} className="flex min-w-0 items-center gap-3 text-white">
                        {logo}
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-bold">{title}</span>
                            {subtitle && <span className="block truncate text-xs text-slate-400">{subtitle}</span>}
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                        aria-label="Close navigation"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="mt-7 min-h-0 flex-1 overflow-y-auto">
                    {children}
                </div>
            </aside>
        </div>
    );
}
