export default function EmptyState({ title, children }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm shadow-slate-950/5">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {children && <p className="mt-2 text-sm text-slate-500">{children}</p>}
        </div>
    );
}
