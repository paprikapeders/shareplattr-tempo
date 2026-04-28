import { usePage } from '@inertiajs/react';

export default function FlashMessages() {
    const { flash = {} } = usePage().props;

    if (!flash.success && !flash.error) {
        return null;
    }

    return (
        <div className="space-y-3">
            {flash.success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm shadow-emerald-950/5">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{flash.success}</span>
                </div>
            )}
            {flash.error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm shadow-rose-950/5">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                    <span>{flash.error}</span>
                </div>
            )}
        </div>
    );
}
