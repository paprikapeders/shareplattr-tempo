import { Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function ForgotPassword() {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/forgot-password');
    };

    return (
        <AuthLayout title="Shareplattr" backHref="/login" showMobileHero={false} contentClassName="pt-24 lg:py-10">
            <form onSubmit={submit} className="mx-auto mt-8 flex w-full max-w-[320px] flex-col gap-4 lg:mt-10">
                <p className="text-center text-[15px] leading-6 text-[#101010]">
                    Enter your email and we&apos;ll send you a password reset link.
                </p>

                {flash.success && (
                    <p className="text-center text-sm text-emerald-700">
                        {flash.success}
                    </p>
                )}

                <input
                    type="email"
                    placeholder="E-mail"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.email && <p className="-mt-2 text-sm text-red-600">{errors.email}</p>}

                <button
                    type="submit"
                    disabled={processing}
                    className="h-12 w-full whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
                >
                    {processing ? 'Sending...' : 'Send Reset Link'}
                </button>

                <Link href="/login" className="text-center text-[15px] font-medium text-[#101010]">
                    Back to sign in
                </Link>
            </form>
        </AuthLayout>
    );
}
