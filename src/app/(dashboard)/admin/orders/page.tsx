import AdminOrdersManager from '@/components/features/AdminOrdersManager';

export default function AdminOrdersPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600">Manage orders, payments, and refunds</p>
            </div>
            <AdminOrdersManager />
        </div>
    );
}
