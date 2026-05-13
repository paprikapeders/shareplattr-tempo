import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function SearchableSelect({
    name,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    error = false,
    className = '',
    inputClassName = '',
    listboxClassName = '',
    clearValueOnType = true,
}) {
    const inputId = useId();
    const listboxId = useId();
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const listboxRef = useRef(null);
    const selectedOption = options.find((option) => option.value === value);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(selectedOption?.label ?? '');
    const [activeIndex, setActiveIndex] = useState(0);
    const [listboxStyle, setListboxStyle] = useState({});

    useEffect(() => {
        setQuery(selectedOption?.label ?? '');
    }, [selectedOption?.label]);

    useEffect(() => {
        function closeOnOutsideClick(event) {
            if (
                !wrapperRef.current?.contains(event.target)
                && !listboxRef.current?.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function positionListbox() {
            const rect = inputRef.current?.getBoundingClientRect();

            if (!rect) {
                return;
            }

            setListboxStyle({
                left: `${rect.left}px`,
                top: `${rect.bottom + 6}px`,
                width: `${rect.width}px`,
            });
        }

        positionListbox();
        window.addEventListener('resize', positionListbox);
        window.addEventListener('scroll', positionListbox, true);

        return () => {
            window.removeEventListener('resize', positionListbox);
            window.removeEventListener('scroll', positionListbox, true);
        };
    }, [open]);

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery === '' || selectedOption?.label === query) {
            return options;
        }

        return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
    }, [options, query, selectedOption?.label]);

    const chooseOption = (option) => {
        onChange(option.value);
        setQuery(option.label);
        setOpen(false);
        setActiveIndex(0);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
        } else if (event.key === 'Enter' && open) {
            event.preventDefault();
            if (filteredOptions[activeIndex]) {
                chooseOption(filteredOptions[activeIndex]);
            }
        } else if (event.key === 'Escape') {
            setOpen(false);
            setQuery(selectedOption?.label ?? '');
        }
    };

    const listbox = open ? (
        <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            style={listboxStyle}
            className={`fixed z-50 max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg shadow-slate-950/10 ${listboxClassName}`}
        >
            {filteredOptions.length === 0 ? (
                <div className="px-3.5 py-2.5 text-slate-500">No matching options</div>
            ) : filteredOptions.map((option, index) => (
                <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseOption(option)}
                    className={`block w-full px-3.5 py-2.5 text-left transition ${index === activeIndex ? 'bg-slate-100 text-slate-950' : 'text-slate-700 hover:bg-slate-50'} ${option.value === value ? 'font-semibold' : ''}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    ) : null;

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <input type="hidden" name={name} value={value ?? ''} />
            <input
                ref={inputRef}
                id={inputId}
                data-field={name}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-invalid={error ? 'true' : undefined}
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setOpen(true);
                    setActiveIndex(0);
                    if (clearValueOnType && value) {
                        onChange('');
                    }
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'} ${inputClassName}`}
            />
            {listbox ? createPortal(listbox, document.body) : null}
        </div>
    );
}
