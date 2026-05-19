import EmptyState from './EmptyState';

function initials(value) {
    return (value ?? 'SP')
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function toneClasses(tone) {
    const map = {
        click: 'bg-sky-100 text-sky-700',
        pending: 'bg-amber-100 text-amber-700',
        paid: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-rose-100 text-rose-700',
        link: 'bg-violet-100 text-violet-700',
    };

    return map[tone] ?? 'bg-slate-100 text-slate-700';
}

export default function ActivityFeed({ activities }) {
    return (
        <aside id="activity" className="scroll-mt-24 rounded-[22px] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:p-5 xl:sticky xl:top-[90px] xl:max-h-[420px] xl:overflow-hidden">
            <div className="border-b border-slate-200 px-2 pb-4 text-sm">
                <div className="border-b border-[#25338c] pb-2 font-semibold text-[#25338c]">
                    Activity feed
                </div>
            </div>

            <div className="mt-4 max-h-[360px] space-y-4 overflow-y-auto pr-1 xl:max-h-[330px]">
                {activities.length === 0 ? (
                    <EmptyState
                        title="No activity yet — start sharing to see results here."
                        className="px-4 py-8"
                    />
                ) : (
                    activities.map((activity) => (
                        <article key={activity.id} className="flex items-start gap-3">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${toneClasses(activity.tone)}`}>
                                {initials(activity.title)}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-[15px] font-semibold text-[#2a3041]">{activity.title}</p>
                                    <span className="text-xs text-slate-400">{activity.timestamp}</span>
                                </div>
                                <p className="mt-1 text-[14px] leading-6 text-slate-500">{activity.message}</p>
                            </div>

                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </article>
                    ))
                )}
            </div>
        </aside>
    );
}
