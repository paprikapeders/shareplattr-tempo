import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

function SocialButton({ label, icon }) {
    return (
        <button
            type="button"
            className="mt-3 flex h-11 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-white text-[13px] font-semibold text-[#111111] shadow-[0_10px_22px_rgba(15,23,42,0.10)] transition hover:scale-[1.01]"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

export default function Login() {
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
                    <span className="text-[15px] text-[#101010]">Forgot Password?</span>
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

                <div className="flex items-center gap-4 text-[13px] text-[#777777]">
                    <span className="h-px flex-1 bg-white/80" />
                    <span>Or</span>
                    <span className="h-px flex-1 bg-white/80" />
                </div>

                <div className="flex flex-col gap-0">
                    <SocialButton
                        label="Continue with Google"
                        icon={<span className="text-[18px] font-bold text-[#4285f4]">G</span>}
                    />
                    <SocialButton
                        label="Continue with Facebook"
                        icon={<span className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#1877f2] text-[13px] font-bold leading-none text-white">f</span>}
                    />
                </div>
            </form>
        </AuthLayout>
    );
}
