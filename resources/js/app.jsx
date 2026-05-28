import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const googleTagId = 'G-JZDZKRT95V';

if (typeof window !== 'undefined') {
    if (window.shareplattrGaCleanup) {
        window.shareplattrGaCleanup();
    }

    const trackPageView = () => {
        if (typeof window.gtag !== 'function') {
            return;
        }

        window.gtag('config', googleTagId, {
            page_path: window.location.pathname,
        });
    };

    document.addEventListener('inertia:navigate', trackPageView);
    window.shareplattrGaCleanup = () => {
        document.removeEventListener('inertia:navigate', trackPageView);
    };
}

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
