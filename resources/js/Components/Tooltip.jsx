import { useId } from 'react';

function InfoIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
            <circle cx="10" cy="10" r="7" />
            <path d="M10 9.5v4" />
            <path d="M10 6.4h.01" />
        </svg>
    );
}

export default function Tooltip({ children, label = 'More information', className = '' }) {
    const tooltipId = useId();

    return (
        <span className={`group relative inline-flex items-center ${className}`}>
            <button
                type="button"
                aria-label={label}
                aria-describedby={tooltipId}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/35"
            >
                <InfoIcon />
            </button>
            <span
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-medium normal-case leading-5 tracking-normal text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
            >
                {children}
            </span>
        </span>
    );
}
