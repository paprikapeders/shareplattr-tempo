const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseDateParts(value) {
    if (!value) {
        return null;
    }

    const match = String(value).match(DATE_PATTERN);

    if (!match) {
        return null;
    }

    const [, year, month, day] = match;

    return {
        year: Number(year),
        month: Number(month),
        day: Number(day),
    };
}

export function toLocalDate(value) {
    const parts = parseDateParts(value);

    if (!parts) {
        return null;
    }

    const date = new Date(parts.year, parts.month - 1, parts.day);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

export function toDateValue(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value, fallback = 'No expiry date') {
    const date = toLocalDate(value);

    if (!date) {
        return fallback;
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function formatExpiryDate(value, fallback = 'Ongoing campaign') {
    const date = formatDisplayDate(value, null);

    return date ? `Expires ${date}` : fallback;
}
