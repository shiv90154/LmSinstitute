import AdminAnalyticsDashboard from '@/components/features/AdminAnalyticsDashboard';

export default function AdminAnalyticsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Platform performance metrics and payment tracking</p>
            </div>
            <AdminAnalyticsDashboard />
        </div>
    );
}
