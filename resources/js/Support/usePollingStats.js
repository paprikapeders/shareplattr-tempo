import { useEffect, useState } from 'react';

export default function usePollingStats(url, initialStats, intervalMs = 5000) {
    const [stats, setStats] = useState(initialStats);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

    useEffect(() => {
        if (!url) {
            return undefined;
        }

        let active = true;
        let timeoutId = null;
        let controller = null;

        const poll = async () => {
            controller?.abort();
            controller = new AbortController();

            try {
                const response = await fetch(url, {
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Stats request failed with ${response.status}`);
                }

                const data = await response.json();

                if (active) {
                    setStats(data);
                    setLastUpdatedAt(new Date());
                }
            } catch (error) {
                if (active && error.name !== 'AbortError' && import.meta.env.DEV) {
                    console.debug('Stats polling failed', error);
                }
            } finally {
                if (active) {
                    timeoutId = window.setTimeout(poll, intervalMs);
                }
            }
        };

        timeoutId = window.setTimeout(poll, intervalMs);

        return () => {
            active = false;
            window.clearTimeout(timeoutId);
            controller?.abort();
        };
    }, [url, intervalMs]);

    return { stats, lastUpdatedAt };
}
