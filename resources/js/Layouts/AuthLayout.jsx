import { Link } from '@inertiajs/react';

const peopleImage = '/images/people.png';

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

export default function AuthLayout({
    children,
    title = 'Shareplattr',
    backHref = null,
    showHero = true,
    showMobileHero = showHero,
    subtitle = null,
    contentClassName = '',
    heroClassName = '',
}) {
    return (
        <main className="h-dvh min-h-screen overflow-hidden bg-[#B8E7EA] text-[#111111] lg:h-auto lg:min-h-dvh lg:overflow-x-hidden lg:overflow-y-visible">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1320px] flex-col lg:grid lg:h-auto lg:min-h-dvh lg:max-w-none lg:grid-cols-[52%_48%] lg:items-stretch lg:px-0 lg:py-0">
                {showHero && (
                    <section
                        className={`relative h-[48dvh] min-h-[280px] shrink-0 overflow-hidden lg:flex lg:min-h-dvh lg:items-end lg:justify-center lg:overflow-visible ${showMobileHero ? '' : 'hidden'} ${heroClassName}`}
                        aria-hidden="true"
                    >
                        <img
                            src={peopleImage}
                            alt=""
                            loading="eager"
                            fetchPriority="high"
                            decoding="sync"
                            className="absolute left-1/2 top-2 h-[52dvh] max-w-none -translate-x-1/2 object-contain object-bottom lg:hidden"
                        />
                        <img
                            src={peopleImage}
                            alt=""
                            loading="eager"
                            fetchPriority="high"
                            decoding="sync"
                            className="hidden h-[100vh] w-auto max-w-none object-contain lg:block lg:translate-x-0 xl:h-[104vh] xl:translate-x-4 2xl:h-[106vh] 2xl:translate-x-8"
                        />
                    </section>
                )}

                <section className={`relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-8 py-5 sm:px-10 lg:min-h-dvh lg:px-10 ${showHero && showMobileHero ? '-mt-14 lg:mt-0' : ''} ${contentClassName}`}>
                    {backHref && (
                        <a
                            href={backHref}
                            className="absolute left-9 top-7 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.14)] sm:left-10 lg:h-10 lg:w-10"
                            aria-label="Go back"
                        >
                            <BackIcon />
                        </a>
                    )}

                    <div className="relative z-10 mx-auto flex w-full max-w-[320px] flex-col lg:max-w-[340px] xl:max-w-[360px]">
                        <h1 className="text-center text-[38px] font-extrabold leading-none tracking-normal text-[#111111] lg:text-[42px] lg:font-black xl:text-[48px]">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-4 text-center text-[15px] leading-6 text-[#1f2933]/90">
                                {subtitle}
                            </p>
                        )}

                        {children}

                        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs font-medium text-[#101010]/75">
                            <Link href="/terms-of-use" className="hover:text-[#101010] hover:underline">
                                Terms of Use
                            </Link>
                            <Link href="/privacy-policy" className="hover:text-[#101010] hover:underline">
                                Privacy Policy
                            </Link>
                        </nav>
                    </div>
                </section>
            </div>
        </main>
    );
}
