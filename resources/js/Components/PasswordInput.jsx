import { forwardRef, useState } from 'react';

function EyeIcon({ hidden }) {
    if (hidden) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z" />
                <circle cx="12" cy="12" r="2.5" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
            <path d="M3 12s3.2-6 9-6 9 6 9 6a17.5 17.5 0 0 1-3.2 3.7M9.9 17.6A8.5 8.5 0 0 1 3 12" />
            <path d="M4 4l16 16" />
            <path d="M10.6 10.6a2.5 2.5 0 0 0 2.8 2.8" />
        </svg>
    );
}

const PasswordInput = forwardRef(function PasswordInput({
    name = 'password',
    value,
    onChange,
    placeholder = 'Password',
    className = '',
    error = false,
    ...props
}, ref) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                ref={ref}
                name={name}
                type={visible ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`${className} pr-12`}
                aria-invalid={error ? 'true' : undefined}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="absolute inset-y-0 right-3 flex w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label={visible ? 'Hide password' : 'Show password'}
            >
                <EyeIcon hidden={!visible} />
            </button>
        </div>
    );
});

export default PasswordInput;
