/** @type {import('next').NextConfig} */
const nextConfig = {
    // Temporarily disable ESLint during build due to ESLint v9 compatibility issues
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Performance optimizations
    compress: true,
    poweredByHeader: false,

    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 86400, // 24 hours
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Experimental features for performance
    experimental: {
        // optimizeCss: true,
        // optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },

    // Webpack optimizations
    webpack: (config, { isServer }) => {
        // Fix for "self is not defined" error
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        // Production optimizations
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            enforce: true,
                        },
                    },
                },
            };
        }

        // Bundle analyzer (uncomment to analyze bundle size)
        // if (!dev && !isServer) {
        //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        //   config.plugins.push(
        //     new BundleAnalyzerPlugin({
        //       analyzerMode: 'static',
        //       openAnalyzer: false,
        //     })
        //   );
        // }

        return config;
    },

    // Headers for security and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/fonts/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Redirects for SEO
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
        ];
    },

    // Rewrites for API optimization
    async rewrites() {
        return [
            {
                source: '/api/health',
                destination: '/api/health-check',
            },
        ];
    },
};

export default nextConfig;
