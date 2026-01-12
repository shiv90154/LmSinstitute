import { ReactNode } from 'react';
import Navigation from './navigation';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
            </main>
            <footer className="border-t mt-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-muted-foreground">
                    <p className="text-sm">&copy; 2024 Career Path Institute. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
