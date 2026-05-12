export default function Select({ className = '', children, error = false, ...props }) {
    return (
        <select
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'} ${className}`}
            aria-invalid={error ? 'true' : undefined}
            {...props}
        >
            {children}
        </select>
    );
}
