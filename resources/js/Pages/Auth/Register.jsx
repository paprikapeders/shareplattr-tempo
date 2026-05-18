import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthLayout from '../../Layouts/AuthLayout';
import PasswordInput from '../../Components/PasswordInput';
import { clearFieldError, isBlank, scrollToField } from '../../Support/formValidation';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRequirements = [
    ['length', 'At least 8 characters', (value) => value.length >= 8],
    ['uppercase', 'Contains uppercase letter', (value) => /[A-Z]/.test(value)],
    ['lowercase', 'Contains lowercase letter', (value) => /[a-z]/.test(value)],
    ['number', 'Contains number', (value) => /\d/.test(value)],
    ['special', 'Contains special character', (value) => /[^A-Za-z0-9]/.test(value)],
];

function passwordStrength(password) {
    const completed = passwordRequirements.filter(([, , test]) => test(password)).length;

    if (completed <= 1) {
        return { label: 'Weak', width: '25%', className: 'bg-rose-500' };
    }

    if (completed <= 3) {
        return { label: 'Fair', width: '50%', className: 'bg-amber-500' };
    }

    if (completed === 4) {
        return { label: 'Strong', width: '75%', className: 'bg-cyan-500' };
    }

    return { label: 'Very strong', width: '100%', className: 'bg-emerald-500' };
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
            <path d="M3.5 8 6.5 11 12.5 5" />
        </svg>
    );
}

function PasswordStrengthFeedback({ password }) {
    if (!password) {
        return null;
    }

    const strength = passwordStrength(password);

    return (
        <div className="mt-3 rounded-2xl bg-white/55 p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[#101010]">Password strength</p>
                <p className="text-xs font-bold text-[#101010]">{strength.label}</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full rounded-full transition-all ${strength.className}`} style={{ width: strength.width }} />
            </div>
            <ul className="mt-3 grid gap-1.5 text-xs text-[#3b3d45]">
                {passwordRequirements.map(([key, label, test]) => {
                    const complete = test(password);

                    return (
                        <li key={key} className="flex items-center gap-2">
                            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${complete ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
                                {complete ? <CheckIcon /> : null}
                            </span>
                            <span className={complete ? 'text-[#101010]' : ''}>{label}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function Register({ prefill = {} }) {
    const { data, setData, post, processing, errors: serverErrors, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        email: prefill.email ?? '',
        password: '',
        account_type: prefill.account_type ?? 'participant',
    });
    const [clientErrors, setClientErrors] = useState({});
    const errors = { ...serverErrors, ...clientErrors };

    const fieldError = (field, values) => {
        if (field === 'first_name' && isBlank(values.first_name)) {
            return 'First Name is required.';
        }

        if (field === 'last_name' && isBlank(values.last_name)) {
            return 'Last Name is required.';
        }

        if (field === 'email') {
            if (isBlank(values.email)) {
                return 'Email is required.';
            }

            if (!emailPattern.test(values.email)) {
                return 'Enter a valid email address.';
            }
        }

        if (field === 'password') {
            if (isBlank(values.password)) {
                return 'Password is required.';
            }

            if (values.password.length < 8) {
                return 'Password must be at least 8 characters.';
            }
        }

        return '';
    };

    const updateField = (field, value) => {
        const nextData = { ...data, [field]: value };

        setData(field, value);
        clearErrors(field);
        setClientErrors((current) => {
            if (!current[field]) {
                return current;
            }

            const nextErrors = clearFieldError(current, field);
            const nextFieldError = fieldError(field, nextData);

            if (nextFieldError) {
                nextErrors[field] = nextFieldError;
            }

            return nextErrors;
        });
    };

    const validate = () => {
        const nextErrors = {};

        ['first_name', 'last_name', 'email', 'password'].forEach((field) => {
            const error = fieldError(field, data);

            if (error) {
                nextErrors[field] = error;
            }
        });

        setClientErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            scrollToField(Object.keys(nextErrors)[0]);
            return false;
        }

        return true;
    };

    const submit = (event) => {
        event.preventDefault();
        if (!validate()) {
            return;
        }

        post('/register');
    };

    return (
        <AuthLayout title="Shareplattr" backHref="/login" showMobileHero={false} contentClassName="pt-24 lg:py-10">
            <form onSubmit={submit} className="mx-auto mt-7 flex w-full max-w-[320px] flex-col gap-3.5 lg:mt-9">
                {errors.account_type && <p className="-mt-2 text-sm text-red-600">{errors.account_type}</p>}

                <div>
                    <label className="mb-1.5 block px-1 text-sm font-medium text-[#101010]">
                        First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                        name="first_name"
                        type="text"
                        placeholder="First Name"
                        value={data.first_name}
                        onChange={(event) => updateField('first_name', event.target.value)}
                        className={`h-12 w-full rounded-full bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280] ${errors.first_name ? 'border border-red-400' : 'border-0'}`}
                        aria-invalid={errors.first_name ? 'true' : undefined}
                    />
                    {errors.first_name && <p className="mt-1.5 text-sm text-red-600">{errors.first_name}</p>}
                </div>

                <div>
                    <label className="mb-1.5 block px-1 text-sm font-medium text-[#101010]">
                        Last Name <span className="text-red-600">*</span>
                    </label>
                    <input
                        name="last_name"
                        type="text"
                        placeholder="Last Name"
                        value={data.last_name}
                        onChange={(event) => updateField('last_name', event.target.value)}
                        className={`h-12 w-full rounded-full bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280] ${errors.last_name ? 'border border-red-400' : 'border-0'}`}
                        aria-invalid={errors.last_name ? 'true' : undefined}
                    />
                    {errors.last_name && <p className="mt-1.5 text-sm text-red-600">{errors.last_name}</p>}
                </div>

                <div className="flex flex-col">
                    <label className="mb-1.5 block px-1 text-sm font-medium text-[#101010]">
                        Email <span className="text-red-600">*</span>
                    </label>
                    <input
                        name="email"
                        type="email"
                        placeholder="E-mail"
                        value={data.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        className={`h-12 w-full rounded-full bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280] ${errors.email ? 'border border-red-400' : 'border-0'}`}
                        aria-invalid={errors.email ? 'true' : undefined}
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm leading-5 text-red-500 transition-opacity">
                            {errors.email}
                            {String(errors.email).includes('already registered') && (
                                <>
                                    {' '}
                                    <Link href="/login" className="font-medium text-red-600 underline underline-offset-4 hover:text-red-700">
                                        sign in
                                    </Link>
                                    <span> or </span>
                                    <Link href="/forgot-password" className="font-medium text-red-600 underline underline-offset-4 hover:text-red-700">
                                        reset your password
                                    </Link>
                                    <span>.</span>
                                </>
                            )}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 block px-1 text-sm font-medium text-[#101010]">
                        Password <span className="text-red-600">*</span>
                    </label>
                    <PasswordInput
                        name="password"
                        placeholder="Enter Your Password"
                        value={data.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        className={`h-12 w-full rounded-full bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280] ${errors.password ? 'border border-red-400' : 'border-0'}`}
                        error={Boolean(errors.password)}
                    />
                    {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
                    <PasswordStrengthFeedback password={data.password} />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-8 h-12 w-full whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 lg:mt-8"
                >
                    {processing ? 'Creating...' : 'Create My Account'}
                </button>

                <p className="text-center text-[15px] text-[#101010] lg:hidden">
                    <Link href="/login" className="font-medium">
                        Already have an account? Sign in &rarr;
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
