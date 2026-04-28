export default function PageHeader({ title, eyebrow, description, children }) {
    return (
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
                {eyebrow && (
                    <p className="text-sm font-semibold uppercase text-slate-500">{eyebrow}</p>
                )}
                <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
                {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
                )}
            </div>
            {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
    );
}
