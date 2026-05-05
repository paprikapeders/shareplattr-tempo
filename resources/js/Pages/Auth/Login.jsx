import { Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function Login() {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login');
    };

    return (
        <AuthLayout title="Shareplattr" contentClassName="justify-start pt-0 pb-5 lg:justify-center lg:py-10">
            <form onSubmit={submit} className="mx-auto mt-5 flex w-full max-w-[320px] flex-col gap-3 lg:mt-10 lg:gap-4">
                {flash.success && (
                    <p className="text-center text-sm text-emerald-700">
                        {flash.success}
                    </p>
                )}
                {flash.error && (
                    <p className="text-center text-sm text-red-600">
                        {flash.error}
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

                <input
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.password && <p className="-mt-2 text-sm text-red-600">{errors.password}</p>}

                <div className="-mt-1 text-right">
                    <Link href="/forgot-password" className="text-[15px] text-[#101010]">
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-1 h-12 w-full whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 lg:mt-2"
                >
                    {processing ? 'Signing In...' : 'Sign In'}
                </button>

                <p className="text-center text-[15px] leading-6 text-[#101010]">
                    Don&apos;t have an account yet?<br />
                    <Link href="/register" className="font-medium">
                        Create right now
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
