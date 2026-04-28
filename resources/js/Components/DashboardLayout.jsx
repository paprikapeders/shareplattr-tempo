import ClientLayout from '../Layouts/ClientLayout';

const channels = [
    'All channels',
    'Facebook',
    'Instagram',
    'LinkedIn',
    'YouTube',
    'Twitter',
];

export default function DashboardLayout({ children }) {
    return (
        <ClientLayout>
            <div className="space-y-6 pb-8 lg:space-y-7">
                {children}
            </div>
        </ClientLayout>
    );
}

export function DashboardChannelTabs() {
    return (
        <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-7 text-[15px] text-slate-400">
                {channels.map((channel) => (
                    <button
                        key={channel}
                        type="button"
                        className={`border-b-2 pb-5 transition ${channel === 'Instagram' ? 'border-[#23348d] font-medium text-[#23348d]' : 'border-transparent hover:text-slate-600'}`}
                    >
                        {channel}
                    </button>
                ))}
            </div>
        </div>
    );
}
