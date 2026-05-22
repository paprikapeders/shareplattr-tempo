import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import AuthLayout from '../../Layouts/AuthLayout';
import PasswordInput from '../../Components/PasswordInput';

export default function Login() {
    const { flash = {} } = usePage().props;
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const { data, setData, post, processing, errors, transform } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        const payload = {
            ...data,
            email: emailRef.current?.value ?? data.email,
            password: passwordRef.current?.value ?? data.password,
        };

        setData(payload);
        transform(() => payload);

        post('/login', {
            preserveScroll: true,
            onFinish: () => transform((currentData) => currentData),
        });
    };

    return (
        <AuthLayout
            title="Shareplattr"
            heroClassName="auth-login-hero !absolute inset-x-0 top-0 z-0 !h-[36dvh] !min-h-[220px] opacity-95 after:absolute after:inset-x-0 after:bottom-0 after:h-24 after:bg-gradient-to-b after:from-transparent after:to-[#B8E7EA] lg:!relative lg:!h-auto lg:!min-h-dvh lg:opacity-100 lg:after:hidden"
            contentClassName="auth-login-content !mt-0 justify-start px-9 pb-2 pt-[29dvh] lg:justify-center lg:px-10 lg:py-10"
        >
            <div className="auth-login-intro relative z-10 mx-auto mt-0 w-full max-w-[320px] text-center lg:mt-7">
                <p className="auth-login-headline text-[20px] font-black leading-tight text-[#111111] lg:text-[26px]">
                    Earn rewards for sharing brands you love.
                </p>
                <p className="auth-login-copy mt-1.5 text-[13px] leading-[1.45] text-[#1f2933]/85 lg:mt-2 lg:text-[15px] lg:leading-6">
                    Join campaigns, share your referral link, and earn when your recommendations turn into real conversions.
                </p>
            </div>

            <form onSubmit={submit} className="auth-login-form relative z-10 mx-auto mt-3 flex w-full max-w-[320px] flex-col gap-2.5 lg:mt-7 lg:gap-4">
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

                <div className="grid gap-2">
                    <a
                        href="/auth/google/redirect"
                        className="auth-login-control flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-[#101010] shadow-[0_10px_24px_rgba(15,23,42,0.10)] transition hover:scale-[1.01] hover:opacity-95 lg:h-12"
                    >
                        <span className="text-base font-black text-[#4285F4]">G</span>
                        <span>Continue with Google</span>
                    </a>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-[#101010]/55">
                    <span className="h-px flex-1 bg-white/70" />
                    <span>Email login</span>
                    <span className="h-px flex-1 bg-white/70" />
                </div>

                <input
                    ref={emailRef}
                    name="email"
                    type="email"
                    placeholder="E-mail"
                    autoComplete="email"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="auth-login-control h-11 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-[0_10px_24px_rgba(15,23,42,0.10)] outline-none placeholder:text-[#6f7280] lg:h-12"
                />
                {errors.email && <p className="-mt-2 text-sm text-red-600">{errors.email}</p>}

                <PasswordInput
                    ref={passwordRef}
                    name="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="auth-login-control h-11 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-[0_10px_24px_rgba(15,23,42,0.10)] outline-none placeholder:text-[#6f7280] lg:h-12"
                    error={Boolean(errors.password)}
                />
                {errors.password && <p className="-mt-2 text-sm text-red-600">{errors.password}</p>}

                <div className="-mt-1 flex items-center justify-between gap-3">
                    <label className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-[#101010]">
                        <input
                            name="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(event) => setData('remember', event.target.checked)}
                            className="h-4 w-4 rounded border-white bg-white text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-300"
                        />
                        <span>Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-[15px] text-[#101010]">
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="auth-login-control mt-0.5 h-11 w-full whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 lg:mt-2 lg:h-12"
                >
                    {processing ? 'Signing In...' : 'Log In to My Account'}
                </button>

                <p className="text-center text-[14px] leading-5 text-[#101010] lg:text-[15px] lg:leading-6">
                    <Link href="/register" className="font-medium">
                        Don&apos;t have an account? Get started &rarr;
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
