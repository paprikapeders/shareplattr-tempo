export function isBlank(value) {
    return value === null || value === undefined || String(value).trim() === '';
}

export function scrollToField(name) {
    window.requestAnimationFrame(() => {
        const field = document.querySelector(`[name="${name}"]`);

        if (!field) {
            return;
        }

        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field.focus({ preventScroll: true });
    });
}

export function clearFieldError(errors, field) {
    if (!errors[field]) {
        return errors;
    }

    const nextErrors = { ...errors };
    delete nextErrors[field];

    return nextErrors;
}
