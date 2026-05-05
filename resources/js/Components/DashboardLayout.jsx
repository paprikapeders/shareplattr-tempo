import ClientLayout from '../Layouts/ClientLayout';

export default function DashboardLayout({ children }) {
    return (
        <ClientLayout>
            <div className="space-y-6 pb-8 lg:space-y-7">
                {children}
            </div>
        </ClientLayout>
    );
}
