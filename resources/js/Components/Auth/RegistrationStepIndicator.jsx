export default function RegistrationStepIndicator({ currentStep, steps }) {
    return (
        <ol className="mx-auto mt-6 flex w-full max-w-[340px] items-start justify-between gap-2" aria-label="Registration progress">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                    <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                        {index > 0 && (
                            <span
                                className={`absolute right-1/2 top-4 h-0.5 w-full ${isCompleted || isCurrent ? 'bg-[#7263cf]' : 'bg-white/70'}`}
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                                isCompleted
                                    ? 'bg-[#7263cf] text-white'
                                    : isCurrent
                                        ? 'bg-white text-[#7263cf] ring-2 ring-[#7263cf]'
                                        : 'bg-white/75 text-slate-500'
                            }`}
                        >
                            {isCompleted ? (
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden="true">
                                    <path d="M3.5 8 6.5 11 12.5 5" />
                                </svg>
                            ) : (
                                stepNumber
                            )}
                        </span>
                        <span className={`text-[11px] font-semibold leading-4 sm:text-xs ${isCurrent || isCompleted ? 'text-[#111111]' : 'text-[#101010]/70'}`}>
                            {step}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
