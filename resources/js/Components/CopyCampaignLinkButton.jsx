import { useState } from 'react';
import Button from './Button';

function ClipboardIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <rect x="8" y="7" width="10" height="13" rx="2" />
            <path d="M9.5 4h5a2 2 0 0 1 2 2v1h-9V6a2 2 0 0 1 2-2Z" />
            <path d="M6 17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
        </svg>
    );
}

function absoluteUrl(url) {
    if (!url) {
        return '';
    }

    return new URL(url, window.location.origin).toString();
}

function fallbackCopy(value) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }
}

export default function CopyCampaignLinkButton({ url, className = '' }) {
    const [message, setMessage] = useState(null);

    function showMessage(nextMessage) {
        setMessage(nextMessage);
        window.setTimeout(() => setMessage(null), 1800);
    }

    async function copyLink() {
        const campaignUrl = absoluteUrl(url);

        if (!campaignUrl) {
            showMessage('Campaign link is not available.');
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(campaignUrl);
            } else if (!fallbackCopy(campaignUrl)) {
                throw new Error('Clipboard unavailable');
            }

            showMessage('Campaign link copied.');
        } catch {
            showMessage('Could not copy link. Select and copy it manually.');
        }
    }

    return (
        <div className={`relative inline-flex flex-col items-start gap-2 ${className}`}>
            <Button
                type="button"
                variant="secondary"
                onClick={copyLink}
                className="gap-2"
                aria-label="Copy public campaign link"
                title="Copy public campaign link"
            >
                <ClipboardIcon />
                Copy link
            </Button>
            {message && (
                <div className="absolute left-0 top-full z-40 mt-2 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-slate-950/20" role="status">
                    {message}
                </div>
            )}
        </div>
    );
}
