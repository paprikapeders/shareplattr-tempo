export default function FieldLabel({ children, htmlFor, required = false, className = '' }) {
    return (
        <label htmlFor={htmlFor} className={`block text-sm font-medium text-slate-700 ${className}`}>
            <span>{children}</span>
            {required && <span className="ml-1 text-rose-600" aria-label="required">*</span>}
        </label>
    );
}
