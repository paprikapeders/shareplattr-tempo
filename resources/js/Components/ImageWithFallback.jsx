import { useEffect, useState } from 'react';

function initialsFrom(label = '') {
    const words = label
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (words.length === 0) {
        return 'SP';
    }

    return words.map((word) => word[0]).join('').toUpperCase();
}

export default function ImageWithFallback({
    src,
    alt = '',
    className = '',
    fallbackLabel = 'SharePlattr',
    fallbackText = 'No image yet',
    showFallbackText = true,
    initialsClassName = 'h-10 w-10 rounded-xl text-sm',
    loading = 'lazy',
}) {
    const [failed, setFailed] = useState(false);
    const hasSrc = typeof src === 'string' && src.trim() !== '';

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (hasSrc && !failed) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                loading={loading}
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div
            className={[
                'relative flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#dff7f8_48%,#eef2ff_100%)] text-slate-700',
                className,
            ].join(' ')}
            role={alt ? 'img' : undefined}
            aria-label={alt || undefined}
        >
            <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-cyan-200/55 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 right-0 h-28 w-28 rounded-full bg-violet-200/55 blur-2xl" />
            <div className="relative flex flex-col items-center justify-center gap-1 px-2 text-center">
                <span className={`flex items-center justify-center bg-white/85 font-black text-slate-800 shadow-sm ring-1 ring-white/70 ${initialsClassName}`}>
                    {initialsFrom(fallbackLabel)}
                </span>
                {showFallbackText && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {fallbackText}
                    </span>
                )}
            </div>
        </div>
    );
}
