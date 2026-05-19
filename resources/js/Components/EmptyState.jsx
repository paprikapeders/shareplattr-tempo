export default function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon,
    className = '',
    children,
}) {
    const body = description ?? children;

    return (
        <div className={`rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center ${className}`}>
            {icon && <div className="mb-3 flex justify-center">{icon}</div>}
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {body && <p className="mt-2 text-sm text-slate-600">{body}</p>}
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-4 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
