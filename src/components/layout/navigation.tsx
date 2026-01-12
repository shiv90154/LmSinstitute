'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Menu,
    X,
    User,
    BookOpen,
    FileText,
    Trophy,
    Newspaper,
    LogOut,
    Home
} from 'lucide-react';

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/courses', label: 'Courses', icon: BookOpen },
        { href: '/mock-tests', label: 'Mock Tests', icon: Trophy },
        { href: '/study-materials', label: 'Study Materials', icon: FileText },
        { href: '/current-affairs', label: 'Current Affairs', icon: Newspaper },
        { href: '/blog', label: 'Blog', icon: FileText },
    ];

    return (
        <nav className="bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">
                            Career Path Institute
                        </span>
                        <span className="text-lg font-bold text-gray-900 sm:hidden">
                            CPI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Simple Auth Buttons */}
                        <div className="flex items-center space-x-2">
                            <Link href="/login">
                                <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/register">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                    Sign Up
                                </button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            <div className="border-t pt-2 mt-2 space-y-1">
                                <Link
                                    href="/login"
                                    className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <User className="h-5 w-5" />
                                    <span>Sign In</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
