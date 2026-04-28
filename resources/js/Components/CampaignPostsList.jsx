import EmptyState from './EmptyState';

function HeartIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4.5 w-4.5">
            <path d="M12 20s-6.5-4.5-8.4-8.3C2.4 9 4 6 7.3 6c1.9 0 3.1 1 4.1 2.1C12.4 7 13.6 6 15.5 6 18.8 6 20.4 9 20.4 11.7 18.5 15.5 12 20 12 20Z" />
        </svg>
    );
}

function CommentIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4.5 w-4.5">
            <path d="M20 12c0 3.9-3.6 7-8 7-.8 0-1.6-.1-2.4-.3L5 20l1.3-3.5C5.5 15.3 5 13.7 5 12c0-3.9 3.6-7 8-7s8 3.1 8 7Z" />
        </svg>
    );
}

function BookmarkIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4.5 w-4.5">
            <path d="M7 5h10a1 1 0 0 1 1 1v13l-6-3-6 3V6a1 1 0 0 1 1-1Z" />
        </svg>
    );
}

function displayDate(value) {
    const date = new Date(value);

    return {
        month: date.toLocaleString('en-US', { month: 'short' }),
        day: date.getDate(),
    };
}

function formatCount(value) {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
    }

    return `${value}`;
}

function Thumbnail({ post }) {
    if (post.thumbnail_url) {
        return <img src={post.thumbnail_url} alt="" className="h-[102px] w-[102px] rounded-[24px] object-cover" />;
    }

    return (
        <div className="flex h-[102px] w-[102px] items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#9fd7f0_0%,#5b89ff_55%,#26338c_100%)] text-[32px] font-bold text-white">
            {post.title?.slice(0, 1) ?? 'S'}
        </div>
    );
}

export default function CampaignPostsList({ latestPosts, scheduledPosts }) {
    return (
        <section className="rounded-[28px] bg-white p-5 shadow-[0_22px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:p-6">
            <div className="mb-6">
                <h2 className="text-[18px] font-semibold text-[#2a3041] sm:text-[20px]">Campaign Management</h2>
                <p className="mt-1 text-[15px] text-slate-500">Overview of your published and scheduled posts</p>
            </div>

            <div className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="flex items-center justify-between">
                    <div className="flex gap-7 text-[15px]">
                        <button type="button" className="border-b-2 border-[#2a3041] pb-2 font-semibold text-[#2a3041]">
                            Latest posts
                        </button>
                        <button type="button" className="pb-2 text-slate-400">
                            Scheduled posts
                        </button>
                    </div>
                    <button type="button" className="text-2xl leading-none text-[#687296]">...</button>
                </div>

                <div className="mt-5 space-y-5">
                    {latestPosts.length === 0 ? (
                        <EmptyState title="No campaign posts yet.">
                            Generate referral links from the Campaigns page to start building your dashboard activity.
                        </EmptyState>
                    ) : (
                        latestPosts.map((post) => {
                            const { month, day } = displayDate(post.created_at);

                            return (
                                <div key={post.id} className="flex gap-4 rounded-[22px] border border-slate-100 p-3 sm:gap-5 sm:p-4">
                                    <div className="hidden min-w-[18px] flex-col items-center justify-center text-xs text-slate-500 sm:flex">
                                        <span>{month}</span>
                                        <span>{day}</span>
                                    </div>

                                    <Thumbnail post={post} />

                                    <div className="min-w-0 flex-1">
                                        <p className="text-[17px] font-semibold text-[#2a3041]">{post.username}</p>
                                        <p className="mt-1 line-clamp-3 text-[15px] leading-7 text-slate-600">
                                            {post.content}
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center gap-5 text-[14px] text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <HeartIcon />
                                                <span>{formatCount(post.clicks_count)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CommentIcon />
                                                <span>{formatCount(post.unique_clicks_count)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookmarkIcon />
                                                <span>{formatCount(post.conversions_count)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {scheduledPosts.length === 0 && (
                    <div className="mt-5 rounded-[20px] border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                        Scheduled posts will appear here when SharePlattr supports scheduling.
                    </div>
                )}
            </div>
        </section>
    );
}
