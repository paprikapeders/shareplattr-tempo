import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import BrandLogo, { brandLogo } from '../../Components/BrandLogo';

const asset = (name) => `/landing/assets/${name}`;

function IconArrowRight({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

function IconMenu({ className = 'w-6 h-6' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
        </svg>
    );
}

function IconX({ className = 'w-6 h-6' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

function IconSparkles({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9.9 4.2 8.7 7.4 5.5 8.6l3.2 1.2 1.2 3.2 1.2-3.2 3.2-1.2-3.2-1.2-1.2-3.2Z" />
            <path d="M18 12.5 17.2 15l-2.5.8 2.5.8.8 2.5.8-2.5 2.5-.8-2.5-.8-.8-2.5Z" />
        </svg>
    );
}

function IconUser({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function IconBriefcase({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
            <rect height="14" rx="2" width="18" x="3" y="6" />
            <path d="M3 12h18" />
        </svg>
    );
}

function IconCheck({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

function IconLink({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" />
        </svg>
    );
}

function IconDollar({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

function IconTarget({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1" />
        </svg>
    );
}

function IconChart({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 3v18h18" />
            <path d="m7 15 4-4 3 3 5-7" />
        </svg>
    );
}

function IconGift({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <rect height="4" width="18" x="3" y="8" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 1 1 4.5-1.5V8" />
            <path d="M16.5 8A2.5 2.5 0 1 0 12 6.5V8" />
        </svg>
    );
}

function IconTrophy({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
            <path d="M5 5H3v2a4 4 0 0 0 4 4" />
            <path d="M19 5h2v2a4 4 0 0 1-4 4" />
        </svg>
    );
}

function IconMail({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <rect height="16" rx="2" width="20" x="2" y="4" />
            <path d="m22 7-10 6L2 7" />
        </svg>
    );
}

function IconChevronDown({ className = 'size-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function Button({ children, className = '', type = 'button', ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 ${className}`}
            type={type}
            {...props}
        >
            {children}
        </button>
    );
}

function Input({ className = '', ...props }) {
    return (
        <input
            className={`border-input block h-9 w-full max-w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-gray-400 focus-visible:border-purple-300 focus-visible:ring-[3px] focus-visible:ring-purple-100 md:text-sm ${className}`}
            {...props}
        />
    );
}

const referrerSteps = [
    { icon: IconUser, title: 'Join free', description: 'Sign up in seconds. No fees, no follower minimums.' },
    { icon: IconSparkles, title: 'Browse campaigns', description: 'Explore offers from businesses that match your interests.' },
    { icon: IconLink, title: 'Share via unique link', description: 'Get a personalized link to share anywhere you have reach.' },
    { icon: IconDollar, title: 'Earn on conversion', description: 'Get paid when your referrals convert. Transparent tracking.' },
];

const businessSteps = [
    { icon: IconBriefcase, title: 'Create campaign', description: 'Set your goals, define your ideal referrer profile.' },
    { icon: IconTarget, title: 'Set reward/terms', description: 'Decide what you pay and when, only on results.' },
    { icon: IconSparkles, title: 'Referrers share', description: 'Motivated referrers spread your offer to their networks.' },
    { icon: IconChart, title: 'Pay only on results', description: 'You only pay when a referral converts. Zero wasted spend.' },
];

const referrerReasons = [
    { icon: IconUser, title: 'No follower minimums', description: 'Your network size does not matter. Whether you have 50 followers or 50,000, you can start earning from day one.' },
    { icon: IconSparkles, title: 'Open marketplace', description: 'No gatekeeping, no applications, no waiting for approval. Browse campaigns and start sharing immediately.' },
    { icon: IconChart, title: 'Real payouts with transparent tracking', description: 'See every click, conversion, and dollar earned in real time. No black boxes, no hidden fees.' },
];

const businessReasons = [
    { icon: IconTarget, title: 'Performance-based', description: 'Pay only when a referral converts. No upfront costs, no retainers, no wasted ad spend on empty impressions.' },
    { icon: IconUser, title: 'Instant access to motivated referrers', description: 'Tap into a network of eager referrers who are actively looking for campaigns to share.' },
    { icon: IconBriefcase, title: 'You control everything', description: 'Set your own campaign terms, reward amounts, and targeting. Full control, full flexibility.' },
];

const foundingReferrerPerks = [
    { icon: IconUser, text: 'Priority access to high-value campaigns' },
    { icon: IconGift, text: 'Bonus payout multiplier for first 90 days' },
    { icon: IconMail, text: 'Direct line to the product team' },
];

const foundingBusinessPerks = [
    { icon: IconTrophy, text: 'Waived platform fees for first 6 months' },
    { icon: IconChart, text: 'Featured placement in early marketplace' },
    { icon: IconMail, text: 'Dedicated onboarding and campaign strategy support' },
];

const faqs = [
    {
        question: 'When does Shareplattr launch?',
        answer: 'We are targeting a public launch in Q3 2025. Founding partners will get access 4-6 weeks before everyone else. Joining the waitlist secures your spot in line.',
    },
    {
        question: 'Is there a cost to join as a Referrer?',
        answer: 'Absolutely not. It is completely free to sign up, browse campaigns, and start sharing. We only make money when you do, through a small platform fee deducted from successful conversions.',
    },
    {
        question: 'How do Businesses pay Referrers?',
        answer: "Businesses deposit funds into an escrow-style system. When a referral converts, the agreed reward is automatically released to the referrer. Payouts happen weekly or on-demand, depending on the referrer's preference.",
    },
    {
        question: 'Do I need a big following to be a Referrer?',
        answer: 'Not at all. Shareplattr is designed for everyone, from niche community builders to mega-influencers. Many campaigns target highly specific, small audiences. Quality engagement beats raw numbers.',
    },
    {
        question: 'Is it available in my country?',
        answer: 'We are launching in the United States, United Kingdom, Canada, and Australia first. We will expand to EU markets and beyond shortly after. Joining the waitlist helps us prioritize which regions to open next.',
    },
];

function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const goTo = (id) => {
        scrollToSection(id);
        setIsOpen(false);
    };

    const navSurfaceClass = isOpen
        ? 'bg-[#c9f4ec] border-b border-[#9fdcd5] shadow-card'
        : isScrolled
            ? 'glass-strong border-b border-white/30'
            : 'bg-transparent';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navSurfaceClass}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <button
                        className="flex items-center transition-opacity hover:opacity-80"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        type="button"
                        aria-label="Shareplattr"
                    >
                        <BrandLogo className="h-10 w-auto max-w-[170px]" alt="Shareplattr" />
                    </button>

                    <div className="hidden md:flex items-center gap-8">
                        <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium" onClick={() => goTo('how-it-works')} type="button">
                            How It Works
                        </button>
                        <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium" onClick={() => goTo('why-shareplattr')} type="button">
                            Why Shareplattr
                        </button>
                        <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium" onClick={() => goTo('founding-partner')} type="button">
                            Founding Partner
                        </button>
                        <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium" onClick={() => goTo('faq')} type="button">
                            FAQ
                        </button>
                        <Button className="btn-gradient font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:scale-105" onClick={() => goTo('footer-cta')}>
                            Join Waitlist
                        </Button>
                    </div>

                    <button aria-label="Toggle menu" className="md:hidden text-gray-800 p-2" onClick={() => setIsOpen((value) => !value)} type="button">
                        {isOpen ? <IconX /> : <IconMenu />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-[#c9f4ec] border-b border-[#9fdcd5] shadow-card">
                    <div className="px-4 py-4 space-y-1">
                        {['how-it-works', 'why-shareplattr', 'founding-partner', 'faq'].map((id) => (
                            <button
                                className="block w-full text-left text-sm text-gray-900 hover:text-purple-700 py-3 font-semibold capitalize"
                                key={id}
                                onClick={() => goTo(id)}
                                type="button"
                            >
                                {id.replace(/-/g, ' ')}
                            </button>
                        ))}
                        <Button className="w-full btn-gradient font-bold py-3 rounded-full mt-2" onClick={() => goTo('footer-cta')}>
                            Join Waitlist
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
}

function Hero() {
    const chooseSignupType = (type) => {
        scrollToSection('footer-cta');
        window.sessionStorage.setItem('signup-type', type);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-300/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-gray-800 text-sm font-semibold mb-8 animate-float">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
                    </span>
                    Launching Soon - Join the Waitlist
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                    The referral marketplace <span className="text-gradient">that pays everyone.</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed">
                    Businesses post campaigns. Referrers share them. Everyone earns.
                </p>
                <p className="text-base text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
                    Shareplattr is launching soon. We are inviting both referrers and businesses to join the waitlist and be first in line when doors open.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Button
                        className="group w-full sm:w-auto btn-gradient font-bold px-8 py-6 rounded-full text-base hover:scale-105"
                        data-signup-type="referrer"
                        onClick={() => chooseSignupType('referrer')}
                    >
                        <IconArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        I am a Referrer - I want to earn
                    </Button>
                    <Button
                        className="group w-full sm:w-auto glass font-bold text-gray-800 px-8 py-6 rounded-full text-base hover:bg-white/40 hover:scale-105 transition-all"
                        data-signup-type="business"
                        onClick={() => chooseSignupType('business')}
                    >
                        <IconArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        I am a Business - I want to grow
                    </Button>
                </div>

                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-gray-600 text-sm">
                    <IconSparkles className="w-4 h-4 text-purple-600" />
                    <span>
                        <span className="text-purple-700 font-bold">2,847</span> businesses and referrers already on the waitlist
                    </span>
                </div>
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section className="relative py-24 lg:py-32 bg-white" id="how-it-works">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Simple by design.</h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">Two paths, one marketplace. Pick yours.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                            <IconUser className="w-4 h-4" />
                            For Referrers
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Turn your network into income.</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Join free, browse campaigns from brands you actually like, share your unique link, and get paid every time someone converts. No gatekeeping. No follower minimums.
                        </p>
                        <img alt="Referral network illustration" className="w-full max-w-md rounded-2xl" src={asset('referral-illustration.png')} />
                    </div>

                    <div className="space-y-4">
                        {referrerSteps.map((step) => (
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-hover hover:border-purple-200 transition-all duration-300" key={step.title}>
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <step.icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 font-bold mb-1">{step.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="order-2 lg:order-1 space-y-4">
                        {businessSteps.map((step) => (
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-hover hover:border-purple-200 transition-all duration-300" key={step.title}>
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                    <step.icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 font-bold mb-1">{step.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-bold mb-6">
                            <IconBriefcase className="w-4 h-4" />
                            For Businesses
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Grow with zero wasted spend.</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Create a campaign, set your reward and terms, and let motivated referrers do the rest. You only pay when you get real results, no upfront costs, no retainers.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function WhyShareplattr() {
    return (
        <section className="relative py-24 lg:py-32" id="why-shareplattr">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Built for the people <span className="text-gradient">the old platforms ignored.</span>
                    </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-1 rounded-full bg-purple-400" />
                            <span className="text-sm font-bold text-purple-700 uppercase tracking-wider">For Referrers</span>
                        </div>
                        <div className="grid gap-4">
                            {referrerReasons.map((reason) => (
                                <div className="glass rounded-2xl p-6 hover:bg-white/40 transition-all duration-300" key={reason.title}>
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                                        <reason.icon className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-2">{reason.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-1 rounded-full bg-gray-300" />
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">For Businesses</span>
                        </div>
                        <div className="grid gap-4">
                            {businessReasons.map((reason) => (
                                <div className="glass rounded-2xl p-6 hover:bg-white/40 transition-all duration-300" key={reason.title}>
                                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                                        <reason.icon className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-2">{reason.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FoundingPartner() {
    return (
        <section className="relative py-24 lg:py-32 bg-white" id="founding-partner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-14">
                    <div className="flex items-center justify-center order-1 lg:order-1">
                        <img alt="Founding partner trophy" className="w-full max-w-sm h-auto" src={asset('trophy.png')} />
                    </div>
                    <div className="order-2 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                            <IconTrophy className="w-4 h-4" />
                            Limited Founding Cohort
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Be here <span className="text-gradient">before everyone else.</span>
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            We are hand-picking a small founding cohort to shape the product, get early access, and earn exclusive perks. This is not a mass signup, it is a head start.
                        </p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                    <div className="rounded-3xl bg-white border border-gray-100 shadow-card hover:shadow-hover p-8 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <IconUser className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-xl">Founding Referrers</h3>
                        </div>
                        <ul className="space-y-4">
                            {foundingReferrerPerks.map((perk) => (
                                <li className="flex items-start gap-3" key={perk.text}>
                                    <perk.icon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-500 text-sm">{perk.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-3xl bg-white border border-gray-100 shadow-card hover:shadow-hover p-8 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                                <IconTrophy className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-xl">Founding Businesses</h3>
                        </div>
                        <ul className="space-y-4">
                            {foundingBusinessPerks.map((perk) => (
                                <li className="flex items-start gap-3" key={perk.text}>
                                    <perk.icon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-500 text-sm">{perk.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="text-center">
                    <Button className="group btn-gradient font-bold px-10 py-6 rounded-full text-lg hover:scale-105" onClick={() => scrollToSection('footer-cta')}>
                        <IconArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        Claim your founding spot
                    </Button>
                </div>
            </div>
        </section>
    );
}

function FAQ() {
    const [open, setOpen] = useState(null);

    return (
        <section className="relative py-24 lg:py-32" id="faq">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Questions? <span className="text-gradient">Answered.</span>
                    </h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const isOpen = open === index;
                        return (
                            <div
                                className="glass rounded-2xl px-6 data-[state=open]:bg-white/40 data-[state=open]:shadow-card transition-all duration-300"
                                data-state={isOpen ? 'open' : 'closed'}
                                key={faq.question}
                            >
                                <h3 className="flex">
                                    <button
                                        aria-expanded={isOpen}
                                        className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-5 text-left text-gray-900 font-bold hover:no-underline hover:text-purple-700 transition-colors outline-none focus-visible:ring-[3px] [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-purple-600"
                                        data-state={isOpen ? 'open' : 'closed'}
                                        onClick={() => setOpen(isOpen ? null : index)}
                                        type="button"
                                    >
                                        {faq.question}
                                        <IconChevronDown className="text-gray-500 pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
                                    </button>
                                </h3>
                                {isOpen && <div className="text-gray-500 text-sm leading-relaxed pb-5">{faq.answer}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function FooterCTA() {
    const [referrerEmail, setReferrerEmail] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [referrerState, setReferrerState] = useState({ status: 'idle', message: '' });
    const [businessState, setBusinessState] = useState({ status: 'idle', message: '' });

    const submitWaitlist = async ({ event, email, type, setEmail, setState }) => {
        event.preventDefault();

        if (!email.trim()) {
            setState({ status: 'error', message: 'Enter a valid email address.' });
            return;
        }

        setState({ status: 'loading', message: '' });

        try {
            const response = await window.axios.post('/waitlist', {
                email,
                type,
                source_page: 'landing',
            });

            if (response.data.status === 'duplicate') {
                setState({ status: 'duplicate', message: response.data.message });
                return;
            }

            setEmail('');
            setState({ status: 'success', message: response.data.message });
        } catch (error) {
            const message = error.response?.data?.message
                || error.response?.data?.errors?.email?.[0]
                || 'We could not join the waitlist right now. Please try again.';

            setState({ status: 'error', message });
        }
    };

    return (
        <section className="relative py-24 lg:py-32 bg-white" id="footer-cta">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Don&apos;t miss the <span className="text-gradient">launch.</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">Pick your path and we will notify you the moment doors open.</p>
                </div>

                <div className="grid min-w-0 md:grid-cols-2 gap-6">
                    <div className="min-w-0 rounded-3xl bg-white border border-gray-100 shadow-card hover:shadow-hover p-6 sm:p-8 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <IconMail className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-xl">Join as a Referrer</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">Get early access to campaigns and start earning before everyone else.</p>
                        {referrerState.status === 'success' || referrerState.status === 'duplicate' ? (
                            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 flex items-center gap-3">
                                <IconCheck className="w-5 h-5 text-purple-600" />
                                <span className="text-purple-700 font-bold">{referrerState.message}</span>
                            </div>
                        ) : (
                            <form
                                className="min-w-0 space-y-4"
                                onSubmit={(event) => submitWaitlist({
                                    event,
                                    email: referrerEmail,
                                    type: 'referrer',
                                    setEmail: setReferrerEmail,
                                    setState: setReferrerState,
                                })}
                            >
                                <Input
                                    className="h-12 rounded-full bg-gray-50 px-5 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-purple-300"
                                    disabled={referrerState.status === 'loading'}
                                    onChange={(event) => {
                                        setReferrerEmail(event.target.value);
                                        if (referrerState.status === 'error') {
                                            setReferrerState({ status: 'idle', message: '' });
                                        }
                                    }}
                                    placeholder="Enter your email"
                                    required
                                    type="email"
                                    value={referrerEmail}
                                />
                                <Button
                                    className="w-full group btn-gradient font-bold py-6 rounded-full"
                                    data-signup-type="referrer"
                                    disabled={referrerState.status === 'loading'}
                                    type="submit"
                                >
                                    <IconArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    {referrerState.status === 'loading' ? 'Joining...' : 'Join as a Referrer'}
                                </Button>
                                {referrerState.status === 'error' && <p className="text-sm font-bold text-red-600">{referrerState.message}</p>}
                            </form>
                        )}
                    </div>

                    <div className="min-w-0 rounded-3xl bg-white border border-gray-100 shadow-card hover:shadow-hover p-6 sm:p-8 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                                <IconMail className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-xl">Join as a Business</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">Be first to access our motivated referrer network and grow on your terms.</p>
                        {businessState.status === 'success' || businessState.status === 'duplicate' ? (
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center gap-3">
                                <IconCheck className="w-5 h-5 text-gray-600" />
                                <span className="text-gray-700 font-bold">{businessState.message}</span>
                            </div>
                        ) : (
                            <form
                                className="min-w-0 space-y-4"
                                onSubmit={(event) => submitWaitlist({
                                    event,
                                    email: businessEmail,
                                    type: 'business',
                                    setEmail: setBusinessEmail,
                                    setState: setBusinessState,
                                })}
                            >
                                <Input
                                    className="h-12 rounded-full bg-gray-50 px-5 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-gray-300"
                                    disabled={businessState.status === 'loading'}
                                    onChange={(event) => {
                                        setBusinessEmail(event.target.value);
                                        if (businessState.status === 'error') {
                                            setBusinessState({ status: 'idle', message: '' });
                                        }
                                    }}
                                    placeholder="Enter your email"
                                    required
                                    type="email"
                                    value={businessEmail}
                                />
                                <Button
                                    className="w-full group font-bold py-6 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all"
                                    data-signup-type="business"
                                    disabled={businessState.status === 'loading'}
                                    type="submit"
                                >
                                    <IconArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    {businessState.status === 'loading' ? 'Joining...' : 'Join as a Business'}
                                </Button>
                                {businessState.status === 'error' && <p className="text-sm font-bold text-red-600">{businessState.message}</p>}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function BigStatement() {
    return (
        <section className="relative py-0 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 items-stretch min-h-[500px]">
                    <div className="relative h-64 lg:h-auto">
                        <img alt="Happy people" className="absolute inset-0 w-full h-full object-cover" src={asset('people.png')} />
                    </div>
                    <div className="flex items-center p-8 lg:p-16">
                        <div className="glass rounded-3xl p-8 lg:p-12 w-full">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                                Let&apos;s build a world where anyone can monetize their network and businesses can grow without waste.
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="relative py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="glass rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-700 text-sm font-medium">© {new Date().getFullYear()} Shareplattr. All rights reserved.</p>
                    <p className="text-gray-500 text-sm">Built with purpose.</p>
                </div>
            </div>
        </footer>
    );
}

export default function LandingIndex() {
    return (
        <>
            <Head>
                <title>Shareplattr - Waitlist</title>
                <meta
                    name="description"
                    content="Shareplattr is the referral marketplace that pays everyone. Join the waitlist for referrers and businesses."
                />
                <meta property="og:title" content="Shareplattr - Waitlist" />
                <meta
                    property="og:description"
                    content="Businesses post campaigns. Referrers share them. Everyone earns."
                />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={brandLogo.og} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content={brandLogo.og} />
                <link href="https://fonts.googleapis.com" rel="preconnect" />
                <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <div className="landing-page min-h-screen text-gray-900 font-sans">
                <Navigation />
                <main>
                    <Hero />
                    <HowItWorks />
                    <WhyShareplattr />
                    <FoundingPartner />
                    <FAQ />
                    <FooterCTA />
                    <BigStatement />
                </main>
                <Footer />
            </div>
        </>
    );
}
