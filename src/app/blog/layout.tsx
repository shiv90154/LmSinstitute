import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateWebsiteStructuredData } from '@/lib/utils/seo-utils';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Blog | Career Path Institute - Exam Preparation Tips & Study Guides',
    description: 'Stay updated with the latest exam preparation tips, study guides, and educational insights to help you succeed in competitive exams. Expert advice from Career Path Institute.',
    keywords: ['exam preparation', 'study tips', 'competitive exams', 'patwari exam', 'himachal pradesh', 'career guidance', 'education blog', 'mock tests', 'current affairs'],
    url: '/blog',
    type: 'website',
});

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}

            {/* Website Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateWebsiteStructuredData()),
                }}
            />
        </>
    );
}
