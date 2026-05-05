import { Link } from '@inertiajs/react';
import AuthLayout from '../Layouts/AuthLayout';

function SocialButton({ label, icon }) {
    return (
        <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-white text-[12px] font-semibold text-[#111111] shadow-[0_10px_22px_rgba(15,23,42,0.10)] transition hover:scale-[1.01] lg:h-11"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

export default function Home() {
    return (
        <AuthLayout
            title="Shareplattr"
            subtitle="Hello, we will help you find your specialist!"
            contentClassName="justify-start pt-0 pb-5 lg:justify-center lg:py-10"
        >
            <div className="mx-auto mt-6 flex w-full max-w-[320px] flex-col items-center gap-4 lg:mt-7">
                <Link
                    href="/login"
                    className="flex h-12 w-full items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95"
                >
                    Sign In
                </Link>

                <Link href="/register" className="text-[15px] font-medium text-[#101010]">
                    Sign Up
                </Link>

                <div className="flex w-full items-center gap-4 text-[13px] text-[#777777]">
                    <span className="h-px flex-1 bg-white/80" />
                    <span>Or</span>
                    <span className="h-px flex-1 bg-white/80" />
                </div>

                <div className="flex w-full flex-col gap-2.5">
                    <SocialButton
                        label="Continue with Google"
                        icon={<span className="text-[18px] font-bold text-[#4285f4]">G</span>}
                    />
                    <SocialButton
                        label="Continue with Facebook"
                        icon={<span className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#1877f2] text-[13px] font-bold leading-none text-white">f</span>}
                    />
                </div>
            </div>
        </AuthLayout>
    );
}
