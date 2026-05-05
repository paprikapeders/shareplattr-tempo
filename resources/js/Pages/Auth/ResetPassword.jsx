import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/reset-password');
    };

    return (
        <AuthLayout title="Shareplattr" backHref="/login" showMobileHero={false} contentClassName="pt-24 lg:py-10">
            <form onSubmit={submit} className="mx-auto mt-8 flex w-full max-w-[320px] flex-col gap-4 lg:mt-10">
                <input type="hidden" value={data.token} readOnly />

                <input
                    type="email"
                    placeholder="E-mail"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.email && <p className="-mt-2 text-sm text-red-600">{errors.email}</p>}
                {errors.token && <p className="-mt-2 text-sm text-red-600">{errors.token}</p>}

                <input
                    type="password"
                    placeholder="New Password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.password && <p className="-mt-2 text-sm text-red-600">{errors.password}</p>}

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={data.password_confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="h-12 w-full whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
                >
                    {processing ? 'Resetting...' : 'Reset Password'}
                </button>

                <Link href="/login" className="text-center text-[15px] font-medium text-[#101010]">
                    Back to sign in
                </Link>
            </form>
        </AuthLayout>
    );
}
