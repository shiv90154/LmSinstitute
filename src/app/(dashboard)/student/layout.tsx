import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Student Dashboard - Career Path Institute',
    description: 'Manage your courses, track progress, and access study materials',
};

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
