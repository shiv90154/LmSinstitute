'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    excerpt: string;
    url: string;
}

export default function ShareButton({ title, excerpt, url }: ShareButtonProps) {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title,
                text: excerpt,
                url,
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
            <Share2 className="h-4 w-4" />
            Share
        </button>
    );
}