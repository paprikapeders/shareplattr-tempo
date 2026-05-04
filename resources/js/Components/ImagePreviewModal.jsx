import { useEffect } from 'react';

export default function ImagePreviewModal({ src, isOpen, onClose }) {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !src) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close image preview"
            >
                &times;
            </button>
            <img
                src={src}
                alt=""
                className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}
