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
    mobileTitleClassName = '',
    desktopTitleClassName = '',
    backHref = null,
    showMobileHero = false,
    align = 'center',
}) {
    const alignmentClass = align === 'top' || showMobileHero
        ? 'justify-start pt-14 sm:pt-16 lg:justify-center lg:pt-0'
        : 'justify-center';

    return (
        <main className="min-h-screen overflow-hidden bg-[#b3e1e7] text-[#111111] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
            <section
                className="relative hidden min-h-screen bg-cover bg-left-top lg:block"
                style={{
                    backgroundImage: `url(${mainBg})`,
                }}
                aria-hidden="true"
            />

            <section className={`relative flex min-h-screen flex-col items-center px-6 py-8 sm:px-10 lg:px-16 ${alignmentClass}`}>
                {backHref && (
                    <a
                        href={backHref}
                        className="absolute left-6 top-8 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.10)] sm:left-10 lg:hidden"
                    >
                        <BackIcon />
                    </a>
                )}

                {showMobileHero && (
                    <div className="-mx-6 -mt-8 mb-8 sm:-mx-10 lg:hidden">
                        <div
                            className="h-[46vh] min-h-[310px] w-full bg-cover bg-center"
                            style={{
                                backgroundImage: `linear-gradient(180deg, rgba(179,225,231,0) 58%, #b3e1e7 100%), url(${mainBg})`,
                            }}
                            aria-hidden="true"
                        />
                    </div>
                )}

                <div className="mx-auto flex w-full max-w-md flex-col">
                    <h1 className={`text-center font-bold tracking-tight text-[#111111] ${showMobileHero ? 'text-[54px] leading-none sm:text-[62px] lg:text-[64px]' : 'text-[38px] sm:text-[48px] lg:text-[64px]'} ${mobileTitleClassName} ${desktopTitleClassName}`}>
                        {title}
                    </h1>

                    {children}
                </div>
            </section>
        </main>
    );
}
