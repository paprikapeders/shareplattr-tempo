import mainBg from '../../../figma/main_reso/main_bg.png';

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
    subtitle = null,
}) {
    return (
        <main className="min-h-screen overflow-hidden bg-[#b3e1e7] text-[#111111] lg:flex">
            {showHero && (
                <section className="relative h-[50vh] min-h-[320px] overflow-hidden lg:h-screen lg:min-h-screen lg:w-[55vw] lg:shrink-0" aria-hidden="true">
                    <img
                        src={mainBg}
                        alt=""
                        className="h-full w-full object-cover object-[18%_center] sm:object-[22%_center] lg:w-auto lg:max-w-none lg:translate-x-[2.5vw] lg:object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#b3e1e7]/40 to-[#b3e1e7] lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#b3e1e7]" />
                </section>
            )}

            <section className={`relative flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-16 ${showHero ? '-mt-16 lg:mt-0' : ''}`}>
                {backHref && (
                    <a
                        href={backHref}
                        className="absolute left-6 top-8 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.14)] sm:left-10"
                        aria-label="Go back"
                    >
                        <BackIcon />
                    </a>
                )}

                <div className="relative z-10 mx-auto flex w-full max-w-[400px] flex-col">
                    <h1 className="text-center text-4xl font-extrabold tracking-normal text-[#111111] sm:text-5xl">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-3 text-center text-sm leading-6 text-[#1f2933]/80">
                            {subtitle}
                        </p>
                    )}

                    {children}
                </div>
            </section>
        </main>
    );
}
