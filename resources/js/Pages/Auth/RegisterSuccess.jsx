import { Link } from '@inertiajs/react';

export default function RegisterSuccess({ redirectUrl = '/dashboard' }) {
    return (
        <main className="flex h-dvh min-h-screen items-center justify-center bg-[#B8E7EA] px-8 py-10 text-[#111111]">
            <section className="flex w-full max-w-[360px] flex-col items-center text-center">
                <img
                    src="/images/congratulations.png"
                    alt=""
                    className="h-40 w-40 object-contain sm:h-48 sm:w-48"
                />

                <h1 className="mt-8 text-[38px] font-black leading-none tracking-normal text-[#111111] sm:text-[44px]">
                    Congratulations!
                </h1>

                <Link
                    href={redirectUrl}
                    className="mt-10 flex h-12 w-full items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95"
                >
                    Lets Get Started
                </Link>
            </section>
        </main>
    );
}
