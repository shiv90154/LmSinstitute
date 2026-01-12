/**
 * Service Worker for caching and performance optimization
 */

const CACHE_NAME = 'career-path-lms-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/fonts/GeistVF.woff',
    '/fonts/GeistMonoVF.woff',
    '/_next/static/css/app/layout.css',
];

// API routes to cache with different strategies
const API_CACHE_PATTERNS = {
    // Cache for 1 hour
    longTerm: [
        /\/api\/courses$/,
        /\/api\/blog$/,
        /\/api\/study-materials$/,
    ],
    // Cache for 5 minutes
    shortTerm: [
        /\/api\/auth\/session$/,
        /\/api\/student\/dashboard$/,
    ],
    // Never cache
    noCache: [
        /\/api\/payments\//,
        /\/api\/auth\/(?!session)/,
        /\/api\/admin\//,
    ],
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests (except for known CDNs)
    if (url.origin !== self.location.origin && !isTrustedOrigin(url.origin)) {
        return;
    }

    // Handle different types of requests
    if (isStaticAsset(url.pathname)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(url.pathname)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isPageRequest(request)) {
        event.respondWith(handlePageRequest(request));
    }
});

// Handle static assets (CSS, JS, fonts, images)
function handleStaticAsset(request) {
    return caches.match(request)
        .then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(STATIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                });
        })
        .catch(() => {
            // Return offline fallback for images
            if (request.destination === 'image') {
                return new Response(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
                    { headers: { 'Content-Type': 'image/svg+xml' } }
                );
            }
        });
}

// Handle API requests with different caching strategies
function handleAPIRequest(request) {
    const url = new URL(request.url);

    // Check if this API should not be cached
    if (shouldNotCache(url.pathname)) {
        return fetch(request);
    }

    // Determine cache duration
    const cacheDuration = getCacheDuration(url.pathname);

    return caches.open(DYNAMIC_CACHE)
        .then((cache) => {
            return cache.match(request)
                .then((cachedResponse) => {
                    // Check if cached response is still valid
                    if (cachedResponse && isCacheValid(cachedResponse, cacheDuration)) {
                        return cachedResponse;
                    }

                    // Fetch fresh data
                    return fetch(request)
                        .then((response) => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                // Add timestamp for cache validation
                                const headers = new Headers(responseClone.headers);
                                headers.set('sw-cached-at', Date.now().toString());

                                const modifiedResponse = new Response(responseClone.body, {
                                    status: responseClone.status,
                                    statusText: responseClone.statusText,
                                    headers: headers
                                });

                                cache.put(request, modifiedResponse);
                            }
                            return response;
                        })
                        .catch(() => {
                            // Return cached response if available, even if expired
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            throw new Error('Network error and no cached response available');
                        });
                });
        });
}

// Handle page requests (HTML)
function handlePageRequest(request) {
    return fetch(request)
        .then((response) => {
            // Cache successful page responses
            if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                        cache.put(request, responseClone);
                    });
            }
            return response;
        })
        .catch(() => {
            // Try to serve from cache
            return caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Serve offline page
                    return caches.match('/offline');
                });
        });
}

// Utility functions
function isStaticAsset(pathname) {
    return pathname.startsWith('/_next/static/') ||
        pathname.startsWith('/fonts/') ||
        pathname.match(/\.(css|js|woff|woff2|png|jpg|jpeg|gif|svg|ico)$/);
}

function isAPIRequest(pathname) {
    return pathname.startsWith('/api/');
}

function isPageRequest(request) {
    return request.headers.get('accept')?.includes('text/html');
}

function isTrustedOrigin(origin) {
    const trustedOrigins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://checkout.razorpay.com',
    ];
    return trustedOrigins.includes(origin);
}

function shouldNotCache(pathname) {
    return API_CACHE_PATTERNS.noCache.some(pattern => pattern.test(pathname));
}

function getCacheDuration(pathname) {
    if (API_CACHE_PATTERNS.longTerm.some(pattern => pattern.test(pathname))) {
        return 60 * 60 * 1000; // 1 hour
    }
    if (API_CACHE_PATTERNS.shortTerm.some(pattern => pattern.test(pathname))) {
        return 5 * 60 * 1000; // 5 minutes
    }
    return 60 * 1000; // 1 minute default
}

function isCacheValid(response, maxAge) {
    const cachedAt = response.headers.get('sw-cached-at');
    if (!cachedAt) return false;

    const age = Date.now() - parseInt(cachedAt);
    return age < maxAge;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Handle offline actions when connection is restored
    return Promise.resolve();
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: data.url,
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.notification.data) {
        event.waitUntil(
            clients.openWindow(event.notification.data)
        );
    }
});