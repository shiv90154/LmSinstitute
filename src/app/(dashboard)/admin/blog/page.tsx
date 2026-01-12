import AdminBlogManager from '@/components/features/AdminBlogManager';

export default function AdminBlogPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                <p className="text-gray-600">Manage blog posts and content</p>
            </div>
            <AdminBlogManager />
        </div>
    );
}
