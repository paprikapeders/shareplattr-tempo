export default function Select({ className = '', children, ...props }) {
    return (
        <select
            className={`w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}
