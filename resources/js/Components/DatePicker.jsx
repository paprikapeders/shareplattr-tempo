import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { formatDisplayDate, toDateValue, toLocalDate } from '../Support/dates';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function monthLabel(date) {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

function sameDay(left, right) {
    return left && right
        && left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
}

function buildCalendarDays(monthDate) {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const leadingDays = first.getDay();
    const days = [];

    for (let index = 0; index < leadingDays; index += 1) {
        days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
    }

    return days;
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        </svg>
    );
}

export default function DatePicker({
    label = 'Expires At',
    name,
    value,
    onChange,
    error = false,
    placeholder = 'No expiry date',
    clearable = true,
}) {
    const pickerId = useId();
    const wrapperRef = useRef(null);
    const selectedDate = useMemo(() => toLocalDate(value), [value]);
    const [open, setOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());
    const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

    useEffect(() => {
        if (selectedDate) {
            setVisibleMonth(selectedDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function closeOnOutsideClick(event) {
            if (!wrapperRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        function closeOnEscape(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open]);

    function changeMonth(offset) {
        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    }

    function selectDate(date) {
        onChange(toDateValue(date));
        setOpen(false);
    }

    function clearDate() {
        onChange('');
        setOpen(false);
    }

    return (
        <div ref={wrapperRef} className="relative">
            {name && <input type="hidden" name={name} value={value ?? ''} />}
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`mt-1 flex h-10 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3.5 py-2 text-left text-sm shadow-sm shadow-slate-950/5 outline-none transition focus:ring-4 ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'}`}
                aria-label={label}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={pickerId}
            >
                <span className={selectedDate ? 'font-medium text-slate-900' : 'text-slate-400'}>
                    {formatDisplayDate(value, placeholder)}
                </span>
                <span className="text-slate-400"><CalendarIcon /></span>
            </button>

            {open && (
                <div
                    id={pickerId}
                    role="dialog"
                    aria-label={`${label} calendar`}
                    className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/10"
                >
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                            aria-label="Previous month"
                        >
                            <span aria-hidden="true">&lsaquo;</span>
                        </button>
                        <p className="text-sm font-bold text-slate-950" aria-live="polite">{monthLabel(visibleMonth)}</p>
                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                            aria-label="Next month"
                        >
                            <span aria-hidden="true">&rsaquo;</span>
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-slate-400">
                        {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-1">
                        {days.map((date, index) => {
                            if (!date) {
                                return <span key={`empty-${index}`} />;
                            }

                            const selected = sameDay(date, selectedDate);

                            return (
                                <button
                                    key={toDateValue(date)}
                                    type="button"
                                    onClick={() => selectDate(date)}
                                    className={`h-9 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${selected ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-cyan-50 hover:text-cyan-700'}`}
                                    aria-pressed={selected}
                                    aria-label={`${selected ? 'Selected ' : ''}${formatDisplayDate(toDateValue(date))}`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {clearable && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={clearDate}
                                className="text-sm font-semibold text-slate-500 transition hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                                aria-label={`Clear ${label}`}
                            >
                                Clear date
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
