import { useCallback, useState } from 'react';

export const SIDEBAR_STORAGE_KEY = 'shareplattr.sidebar.expanded';

function readStoredPreference() {
    if (typeof window === 'undefined') {
        return true;
    }

    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (stored === 'false') {
        return false;
    }

    if (stored === 'true') {
        return true;
    }

    return true;
}

export default function useSidebarPreference() {
    const [expanded, setExpandedState] = useState(readStoredPreference);

    const setExpanded = useCallback((value) => {
        setExpandedState((current) => {
            const next = typeof value === 'function' ? value(current) : value;

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? 'true' : 'false');
            }

            return next;
        });
    }, []);

    return [expanded, setExpanded];
}
