import { useEffect, useId, useRef, useState } from 'react';
import ImagePreviewModal from './ImagePreviewModal';

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024;
const DEFAULT_ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png';

function formatFileSize(bytes) {
    if (!bytes) {
        return '0 KB';
    }

    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatMaxSize(bytes) {
    return bytes % (1024 * 1024) === 0
        ? `${bytes / (1024 * 1024)}MB`
        : formatFileSize(bytes);
}

function UploadIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
        </svg>
    );
}

export default function FileUpload({
    label,
    name,
    onChange,
    error,
    accept = DEFAULT_ACCEPT,
    acceptedFormats = 'JPG, PNG',
    maxSize = DEFAULT_MAX_SIZE,
    currentImageUrl = null,
    currentImageLabel = 'Current image',
    uploadLabel,
}) {
    const inputId = useId();
    const inputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [frontendError, setFrontendError] = useState('');
    const [isCurrentPreviewOpen, setIsCurrentPreviewOpen] = useState(false);
    const visibleError = frontendError || error;
    const fieldLabel = uploadLabel || (currentImageUrl ? 'Replace current image' : label);

    useEffect(() => {
        if (!selectedFile || !selectedFile.type?.startsWith('image/')) {
            setPreviewUrl(null);
            return undefined;
        }

        const nextPreviewUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(nextPreviewUrl);

        return () => URL.revokeObjectURL(nextPreviewUrl);
    }, [selectedFile]);

    function clearInput() {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    function selectFile(file) {
        setFrontendError('');

        if (!file) {
            setSelectedFile(null);
            onChange(null);
            return;
        }

        if (file.size > maxSize) {
            setSelectedFile(null);
            setFrontendError(`File is too large. Maximum size is ${formatMaxSize(maxSize)}.`);
            clearInput();
            onChange(null);
            return;
        }

        setSelectedFile(file);
        onChange(file);
    }

    function handleFileChange(event) {
        selectFile(event.target.files?.[0] ?? null);
    }

    function handleDrop(event) {
        event.preventDefault();
        selectFile(event.dataTransfer.files?.[0] ?? null);
        clearInput();
    }

    return (
        <div>
            {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">{label}</label>}

            {currentImageUrl && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Current Image</p>
                    <div className="mt-2 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCurrentPreviewOpen(true)}
                            className="shrink-0 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-100"
                            aria-label={`Zoom ${currentImageLabel}`}
                        >
                            <img
                                src={currentImageUrl}
                                alt=""
                                className="h-16 w-16 cursor-pointer rounded-lg object-cover transition hover:scale-[1.03] hover:opacity-90"
                            />
                        </button>
                        <div>
                            <p className="text-sm font-medium text-slate-700">{currentImageLabel}</p>
                            <p className="mt-1 text-xs text-slate-500">Click image to zoom</p>
                        </div>
                    </div>
                </div>
            )}

            <input
                id={inputId}
                ref={inputRef}
                type="file"
                name={name}
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className={[
                    'mt-2 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-4 py-6 text-center transition hover:bg-slate-50 focus:outline-none focus:ring-4',
                    visibleError ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-300 focus:border-slate-400 focus:ring-slate-100',
                ].join(' ')}
                aria-describedby={`${inputId}-help ${visibleError ? `${inputId}-error` : ''}`.trim()}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="" className="mb-3 max-h-32 rounded-lg object-contain" />
                ) : (
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UploadIcon />
                    </span>
                )}
                <span className="text-sm font-semibold text-slate-800">{fieldLabel}</span>
                <span className="mt-1 text-sm text-slate-500">Click to upload or drag and drop</span>
                {selectedFile && (
                    <span className="mt-3 max-w-full truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </span>
                )}
            </button>

            <p id={`${inputId}-help`} className="mt-1 text-xs text-slate-500">
                Max file size: {formatMaxSize(maxSize)}. Accepted formats: {acceptedFormats}.
            </p>
            {visibleError && <p id={`${inputId}-error`} className="mt-1 text-sm text-rose-600">{visibleError}</p>}

            <ImagePreviewModal
                src={currentImageUrl}
                isOpen={isCurrentPreviewOpen}
                onClose={() => setIsCurrentPreviewOpen(false)}
            />
        </div>
    );
}
