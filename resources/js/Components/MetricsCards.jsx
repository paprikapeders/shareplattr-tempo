import ConversionLabel from './ConversionLabel';

function compactNumber(value) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}m`;
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
    }

    return `${value}`;
}

function compactDollars(cents) {
    const dollars = cents / 100;

    if (dollars >= 1000) {
        return `${(dollars / 1000).toFixed(1)}k`;
    }

    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(dollars);
}

function HeartIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12 21s-7-4.7-9.3-9.1C1.1 8.7 3 5 6.8 5c2 0 3.2 1 4.2 2.2C12 6 13.3 5 15.2 5 19 5 21 8.8 21.3 11.9 19 16.3 12 21 12 21Z" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19.5C3 16.9 5.4 15 9 15s6 1.9 6 4.5V21H3v-1.5ZM15.5 21v-1.3c0-1.4-.6-2.6-1.6-3.5.9-.4 2-.7 3.1-.7 2.9 0 4.9 1.5 4.9 3.8V21h-6.4Z" />
        </svg>
    );
}

function EarnedIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12.7 3.2a1 1 0 0 0-1.4 0L8.9 5.6a5 5 0 0 0-1.7 3.8v1.1H5.4a2 2 0 0 0-2 2v4.3a2 2 0 0 0 2 2H18.6a2 2 0 0 0 2-2v-4.3a2 2 0 0 0-2-2h-1.8V9.4a5 5 0 0 0-1.7-3.8l-2.4-2.4ZM9.4 10.5V9.4c0-.8.3-1.5.9-2l1.7-1.7 1.7 1.7c.6.5.9 1.2.9 2v1.1H9.4Z" />
        </svg>
    );
}

function BubbleIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12 4c4.8 0 8.7 3.2 8.7 7.3 0 4-3.9 7.2-8.7 7.2-.8 0-1.6-.1-2.3-.3L4 20l1.8-4.4A6.6 6.6 0 0 1 3.4 11.3C3.4 7.2 7.2 4 12 4Z" />
        </svg>
    );
}

const cards = [
    {
        key: 'total_conversions',
        label: 'Total Conversions',
        icon: HeartIcon,
        formatter: compactNumber,
    },
    {
        key: 'total_clicks',
        label: 'Total Clicks',
        icon: UsersIcon,
        formatter: compactNumber,
    },
    {
        key: 'total_earned',
        label: 'Total Earned',
        icon: EarnedIcon,
        formatter: compactDollars,
    },
    {
        key: 'active_campaigns',
        label: 'Active Campaigns',
        icon: BubbleIcon,
        formatter: compactNumber,
    },
];

export default function MetricsCards({ stats }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <article
                        key={card.key}
                        className="flex min-h-[112px] items-start justify-between rounded-[22px] bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:px-5"
                    >
                        <div>
                            <p className="text-[15px] text-slate-700">
                                {card.key === 'total_conversions' ? <ConversionLabel>{card.label}</ConversionLabel> : card.label}
                            </p>
                            <p className="mt-2 text-[20px] font-bold leading-none text-[#2a3041] sm:text-[22px]">
                                {card.formatter(stats[card.key] ?? 0)}
                            </p>
                        </div>

                        <div className="rounded-full bg-[#25338c] p-2.5 text-white">
                            <Icon />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
