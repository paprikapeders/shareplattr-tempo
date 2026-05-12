import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthLayout from '../../Layouts/AuthLayout';
import { clearFieldError, isBlank, scrollToField } from '../../Support/formValidation';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register({ prefill = {} }) {
    const { data, setData, post, processing, errors: serverErrors, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        email: prefill.email ?? '',
        password: '',
        password_confirmation: '',
        account_type: prefill.account_type ?? 'participant',
        terms_accepted: false,
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

        if (field === 'password_confirmation') {
            if (isBlank(values.password_confirmation)) {
                return 'Confirm Password is required.';
            }

            if (values.password_confirmation !== values.password) {
                return 'Confirm Password must match Password.';
            }
        }

        if (field === 'terms_accepted' && !values.terms_accepted) {
            return 'Please agree to the Terms of Use and Privacy Policy.';
        }

        return '';
    };

    const updateField = (field, value) => {
        const nextData = { ...data, [field]: value };

        setData(field, value);
        clearErrors(field);
        setClientErrors((current) => {
            if (!current[field] && !(field === 'password' && current.password_confirmation)) {
                return current;
            }

            const nextErrors = clearFieldError(current, field);
            const nextFieldError = fieldError(field, nextData);

            if (nextFieldError) {
                nextErrors[field] = nextFieldError;
            }

            if (field === 'password' && current.password_confirmation) {
                const nextConfirmationError = fieldError('password_confirmation', nextData);

                if (nextConfirmationError) {
                    nextErrors.password_confirmation = nextConfirmationError;
                } else {
                    delete nextErrors.password_confirmation;
                }
            }

            return nextErrors;
        });
    };

    const validate = () => {
        const nextErrors = {};

        ['first_name', 'last_name', 'email', 'password', 'password_confirmation', 'terms_accepted'].forEach((field) => {
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
                <div className="grid grid-cols-2 gap-2 rounded-full bg-white/60 p-1 shadow-sm">
                    {[
                        ['participant', 'Participant'],
                        ['business_owner', 'Business'],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => updateField('account_type', value)}
                            className={`w-full whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition ${data.account_type === value ? 'bg-[#111111] text-white' : 'text-[#3b3d45]'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
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
                    <input
                        name="password"
                        type="password"
                        placeholder="Enter Your Password"
                        value={data.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        className={`h-12 w-full rounded-full bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280] ${errors.password ? 'border border-red-400' : 'border-0'}`}
                        aria-invalid={errors.password ? 'true' : undefined}
                    />
                    {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                    <label className="mb-1.5 block px-1 text-sm font-medium text-[#101010]">
                        Confirm Password <span className="text-red-600">*</span>
                    </label>
                    <input
                        name="password_confirmation"
                        type="password"
                        placeholder="Confirm Your Password"
                        value={data.password_confirmation}
                        onChange={(event) => updateField('password_confirmation', event.target.value)}
                        className={`h-12 w-full rounded-full bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280] ${errors.password_confirmation ? 'border border-red-400' : 'border-0'}`}
                        aria-invalid={errors.password_confirmation ? 'true' : undefined}
                    />
                    {errors.password_confirmation && <p className="mt-1.5 text-sm text-red-600">{errors.password_confirmation}</p>}
                </div>

                <label className={`flex items-start gap-3 rounded-2xl bg-white/55 px-4 py-3 text-sm leading-5 text-[#101010] shadow-sm ${errors.terms_accepted ? 'border border-red-400' : ''}`}>
                    <input
                        name="terms_accepted"
                        type="checkbox"
                        checked={data.terms_accepted}
                        onChange={(event) => updateField('terms_accepted', event.target.checked)}
                        className={`mt-1 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 ${errors.terms_accepted ? 'border-red-400' : 'border-slate-300'}`}
                        aria-invalid={errors.terms_accepted ? 'true' : undefined}
                    />
                    <span>
                        I agree <span className="text-red-600">*</span> to the{' '}
                        <Link href="/terms-of-use" className="font-semibold underline underline-offset-4">
                            Terms of Use
                        </Link>
                        {' '}and{' '}
                        <Link href="/privacy-policy" className="font-semibold underline underline-offset-4">
                            Privacy Policy
                        </Link>
                        .
                    </span>
                </label>
                {errors.terms_accepted && <p className="-mt-2 text-sm text-red-600">{errors.terms_accepted}</p>}

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-8 h-12 w-full whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 lg:mt-8"
                >
                    {processing ? 'Creating...' : 'Next'}
                </button>

                <p className="text-center text-[15px] text-[#101010] lg:hidden">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
