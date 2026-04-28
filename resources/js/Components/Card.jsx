export default function Card({ as = 'section', className = '', children }) {
    const Component = as;

    return (
        <Component className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/5 ${className}`}>
            {children}
        </Component>
    );
}
