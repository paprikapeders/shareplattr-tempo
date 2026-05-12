import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function Register({ prefill = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: prefill.email ?? '',
        password: '',
        password_confirmation: '',
        account_type: prefill.account_type ?? 'participant',
        terms_accepted: false,
    });

    const submit = (event) => {
        event.preventDefault();
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
                            onClick={() => setData('account_type', value)}
                            className={`w-full whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition ${data.account_type === value ? 'bg-[#111111] text-white' : 'text-[#3b3d45]'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {errors.account_type && <p className="-mt-2 text-sm text-red-600">{errors.account_type}</p>}

                <input
                    type="text"
                    placeholder="First Name"
                    value={data.first_name}
                    onChange={(event) => setData('first_name', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.first_name && <p className="-mt-2 text-sm text-red-600">{errors.first_name}</p>}

                <input
                    type="text"
                    placeholder="Last Name"
                    value={data.last_name}
                    onChange={(event) => setData('last_name', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.last_name && <p className="-mt-2 text-sm text-red-600">{errors.last_name}</p>}

                <div className="flex flex-col">
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        className={`h-12 w-full rounded-full bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280] ${errors.email ? 'border border-red-400' : 'border-0'}`}
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm leading-5 text-red-500 transition-opacity">
                            {errors.email}{' '}
                            <Link href="/login" className="font-medium text-red-600 underline underline-offset-4 hover:text-red-700">
                                sign in
                            </Link>
                            <span> or </span>
                            <Link href="/forgot-password" className="font-medium text-red-600 underline underline-offset-4 hover:text-red-700">
                                reset your password
                            </Link>
                            <span>.</span>
                        </p>
                    )}
                </div>

                <input
                    type="password"
                    placeholder="Enter Your Password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.password && <p className="-mt-2 text-sm text-red-600">{errors.password}</p>}

                <input
                    type="password"
                    placeholder="Confirm Your Password"
                    value={data.password_confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />

                <label className="flex items-start gap-3 rounded-2xl bg-white/55 px-4 py-3 text-sm leading-5 text-[#101010] shadow-sm">
                    <input
                        type="checkbox"
                        checked={data.terms_accepted}
                        onChange={(event) => setData('terms_accepted', event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                        I agree to the{' '}
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
