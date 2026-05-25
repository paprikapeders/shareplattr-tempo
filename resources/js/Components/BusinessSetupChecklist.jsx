import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Button from './Button';
import Card from './Card';

const HIDDEN_KEY = 'shareplattr.businessSetupChecklist.hidden';
const WELCOME_KEY = 'shareplattr.businessSetupChecklist.welcomeDismissed';

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M5 12.5 10 17l9-10" />
        </svg>
    );
}

function DotIcon() {
    return <span className="h-2.5 w-2.5 rounded-full bg-current" />;
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    );
}

function WelcomeModal({ onDismiss }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-slate-950">Welcome to SharePlattr</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Set up your profile, add billing, create your first campaign, then go live.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button type="button" onClick={onDismiss}>Get started</Button>
                    <Button type="button" variant="secondary" onClick={onDismiss}>Skip for now</Button>
                </div>
            </div>
        </div>
    );
}

export default function BusinessSetupChecklist({ checklist, className = '' }) {
    const [hidden, setHidden] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    const setupComplete = checklist?.completedCount === checklist?.totalCount;
    const nextStep = useMemo(
        () => checklist?.steps?.find((step) => !step.completed) ?? checklist?.steps?.[checklist.steps.length - 1],
        [checklist],
    );

    useEffect(() => {
        if (!checklist) {
            return;
        }

        setHidden(window.localStorage.getItem(HIDDEN_KEY) === 'true');

        if (checklist.shouldShow && !window.localStorage.getItem(WELCOME_KEY)) {
            setShowWelcome(true);
        }
    }, [checklist]);

    if (!checklist) {
        return null;
    }

    const dismissWelcome = () => {
        window.localStorage.setItem(WELCOME_KEY, 'true');
        setShowWelcome(false);
    };

    const hideChecklist = () => {
        window.localStorage.setItem(HIDDEN_KEY, 'true');
        setHidden(true);
    };

    if (setupComplete && hidden) {
        return null;
    }

    if (!checklist.shouldShow && !setupComplete) {
        return null;
    }

    return (
        <>
            {showWelcome && <WelcomeModal onDismiss={dismissWelcome} />}

            <Card className={`overflow-hidden p-0 ${className}`}>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
                    <div>
                        <p className="text-xs font-bold uppercase text-cyan-600">Business setup</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-950">
                            {setupComplete ? 'Your setup is complete' : 'Launch your first referral campaign'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {setupComplete
                                ? 'You are ready to validate sharing, clicks, conversions, rewards, and payouts.'
                                : 'Follow these steps to move from setup to a live campaign.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {checklist.completedCount} of {checklist.totalCount} complete
                        </span>
                        {setupComplete && (
                            <button
                                type="button"
                                onClick={hideChecklist}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Hide setup checklist"
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-0 divide-y divide-slate-100">
                    {checklist.steps.map((step) => {
                        const isNext = !setupComplete && nextStep?.key === step.key;

                        return (
                            <Link
                                key={step.key}
                                href={step.href}
                                className={`flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50 ${isNext ? 'bg-cyan-50/60' : 'bg-white'}`}
                            >
                                <span className={[
                                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm',
                                    step.completed
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : isNext
                                            ? 'border-cyan-300 bg-cyan-100 text-cyan-700'
                                            : 'border-slate-200 bg-slate-50 text-slate-400',
                                ].join(' ')}>
                                    {step.completed ? <CheckIcon /> : <DotIcon />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-slate-950">{step.label}</span>
                                        {isNext && <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-700">Next</span>}
                                    </span>
                                    <span className="mt-1 block text-sm text-slate-500">{step.description}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="text-sm text-slate-600">
                        {setupComplete ? 'Need to revisit anything?' : `Next up: ${nextStep?.label}`}
                    </p>
                    <Button as={Link} href={nextStep?.href ?? '/business/dashboard'}>
                        {setupComplete ? 'View setup checklist again' : `Continue: ${nextStep?.label}`}
                    </Button>
                </div>
            </Card>
        </>
    );
}
