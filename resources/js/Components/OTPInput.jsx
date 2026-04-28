import { useRef } from 'react';

export default function OTPInput({ value, onChange, length = 6, disabled = false }) {
    const inputRefs = useRef([]);
    const digits = Array.from({ length }, (_, index) => value[index] ?? '');

    const focusIndex = (index) => {
        inputRefs.current[index]?.focus();
        inputRefs.current[index]?.select();
    };

    const updateDigits = (nextDigits) => {
        onChange(nextDigits.join('').slice(0, length));
    };

    const handleChange = (index, nextValue) => {
        const cleanValue = nextValue.replace(/\D/g, '');

        if (!cleanValue) {
            const nextDigits = [...digits];
            nextDigits[index] = '';
            updateDigits(nextDigits);
            return;
        }

        const nextDigits = [...digits];

        cleanValue.slice(0, length - index).split('').forEach((digit, offset) => {
            nextDigits[index + offset] = digit;
        });

        updateDigits(nextDigits);

        const nextIndex = Math.min(index + cleanValue.length, length - 1);
        focusIndex(nextIndex);
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            event.preventDefault();
            focusIndex(index - 1);
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            focusIndex(index - 1);
        }

        if (event.key === 'ArrowRight' && index < length - 1) {
            event.preventDefault();
            focusIndex(index + 1);
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

        if (!pasted) {
            return;
        }

        const nextDigits = Array.from({ length }, (_, index) => pasted[index] ?? '');
        updateDigits(nextDigits);
        focusIndex(Math.min(pasted.length - 1, length - 1));
    };

    return (
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={length}
                    value={digit}
                    disabled={disabled}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    className="h-[52px] w-[46px] rounded-[16px] border-0 bg-white text-center text-xl font-semibold text-slate-900 shadow-none outline-none ring-1 ring-white/60 focus:ring-2 focus:ring-[#7f70e5] sm:h-[62px] sm:w-[54px] sm:rounded-[18px]"
                />
            ))}
        </div>
    );
}
