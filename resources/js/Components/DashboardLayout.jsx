import ClientLayout from '../Layouts/ClientLayout';

export default function DashboardLayout({ children }) {
    return (
        <ClientLayout>
            <div className="pb-6">
                {children}
            </div>
        </ClientLayout>
    );
}
