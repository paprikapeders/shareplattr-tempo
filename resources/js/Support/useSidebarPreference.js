import { useCallback, useState } from 'react';

export const SIDEBAR_STORAGE_KEY = 'shareplattr.sidebar.expanded';
export const BUSINESS_SIDEBAR_STORAGE_KEY = 'shareplattr.business.sidebar.expanded';
export const CLIENT_SIDEBAR_STORAGE_KEY = 'shareplattr.client.sidebar.expanded';

function readStoredPreference(storageKey) {
    if (typeof window === 'undefined') {
        return true;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (stored === 'false') {
        return false;
    }

    if (stored === 'true') {
        return true;
    }

    return true;
}

export default function useSidebarPreference(storageKey = SIDEBAR_STORAGE_KEY) {
    const [expanded, setExpandedState] = useState(() => readStoredPreference(storageKey));

    const setExpanded = useCallback((value) => {
        setExpandedState((current) => {
            const next = typeof value === 'function' ? value(current) : value;

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(storageKey, next ? 'true' : 'false');
            }

            return next;
        });
    }, [storageKey]);

    return [expanded, setExpanded];
}
