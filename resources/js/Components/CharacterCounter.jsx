export default function CharacterCounter({ value = '', max, warningAtPercent = 0.8 }) {
    const length = String(value ?? '').length;
    const warningAt = Math.floor(max * warningAtPercent);
    const tone = length >= max
        ? 'text-rose-600'
        : (length >= warningAt ? 'text-amber-600' : 'text-slate-500');

    return (
        <p className={`mt-1 text-xs ${tone}`} aria-live="polite">
            {length} / {max} characters
        </p>
    );
}
