import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import LoginForm from '@/components/forms/LoginForm';

export const metadata: Metadata = {
    title: 'Login - Career Path Institute',
    description: 'Sign in to your Career Path Institute account to access courses, tests, and study materials.',
};

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect('/student');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Sign in to continue your learning journey
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <LoginForm />
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a
                            href="/register"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign up here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
