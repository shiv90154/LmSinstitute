import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import AdminDashboard from '@/components/features/AdminDashboard';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
            <AdminDashboard />
        </div>
    );
}
