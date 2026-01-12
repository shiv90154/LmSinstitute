import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        redirect('/login');
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto lg:ml-0">
                <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
