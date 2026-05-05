import { Link } from '@inertiajs/react';
import AuthLayout from '../Layouts/AuthLayout';

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
            </div>
        </AuthLayout>
    );
}
