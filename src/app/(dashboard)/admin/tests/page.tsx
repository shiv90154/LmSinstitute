import AdminTestsManager from '@/components/features/AdminTestsManager';

export default function AdminTestsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Mock Tests Management</h1>
                <p className="text-gray-600">Manage mock tests, questions, and analytics</p>
            </div>
            <AdminTestsManager />
        </div>
    );
}
