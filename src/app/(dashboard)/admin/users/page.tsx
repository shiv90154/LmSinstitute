import AdminUsersManager from '@/components/features/AdminUsersManager';

export default function AdminUsersPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            <AdminUsersManager />
        </div>
    );
}
