import AdminCoursesManager from '@/components/features/AdminCoursesManager';

export default function AdminCoursesPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                <p className="text-gray-600">Manage courses, sections, and content</p>
            </div>
            <AdminCoursesManager />
        </div>
    );
}
