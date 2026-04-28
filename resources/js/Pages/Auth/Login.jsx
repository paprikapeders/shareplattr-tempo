import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

function SocialButton({ label, icon }) {
    return (
        <button
            type="button"
            className="mt-3 flex h-[42px] w-full items-center justify-center gap-3 rounded-[18px] bg-white text-[13px] font-semibold text-[#111111] shadow-[0_0_12px_rgba(255,255,255,0.55)]"
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
        <AuthLayout title="Shareplattr" showMobileHero mobileTitleClassName="mt-0">
            <form onSubmit={submit} className="mx-auto mt-8 w-full max-w-[280px] sm:mt-10 sm:max-w-[320px] lg:mt-12">
                <input
                    type="email"
                    placeholder="E-mail"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="h-[48px] w-full rounded-[20px] border-0 bg-white px-5 text-[15px] text-[#111111] outline-none placeholder:text-[#6f7280]"
                />
                {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}

                <input
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="mt-4 h-[48px] w-full rounded-[20px] border-0 bg-white px-5 text-[15px] text-[#111111] outline-none placeholder:text-[#6f7280]"
                />
                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}

                <div className="mt-4 text-right">
                    <span className="text-[15px] text-[#101010]">Forgot Password?</span>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 h-[49px] w-full rounded-[18px] bg-[linear-gradient(90deg,#9284e4_0%,#564e86_100%)] text-[16px] font-bold text-white disabled:opacity-50"
                >
                    {processing ? 'Signing In...' : 'Login'}
                </button>

                <p className="mt-4 text-center text-[15px] leading-7 text-[#101010]">
                    Don&apos;t have an account yet?<br />
                    <Link href="/register" className="font-medium">
                        Create right now
                    </Link>
                </p>

                <div className="mt-5 flex items-center gap-4 text-[13px] text-[#777777]">
                    <span className="h-px flex-1 bg-white/80" />
                    <span>Or</span>
                    <span className="h-px flex-1 bg-white/80" />
                </div>

                <SocialButton
                    label="Continue with Google"
                    icon={<span className="text-[18px] font-bold text-[#4285f4]">G</span>}
                />
                <SocialButton
                    label="Continue with Facebook"
                    icon={<span className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#1877f2] text-[13px] font-bold leading-none text-white">f</span>}
                />
            </form>
        </AuthLayout>
    );
}
