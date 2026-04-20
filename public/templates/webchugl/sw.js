/**
 * WebChuGL Service Worker
 *
 * COOP/COEP header injection for cross-origin isolation (SharedArrayBuffer).
 * Based on coi-serviceworker by Guido Zuidhof (MIT).
 *
 * Also provides dynamic caching (stale-while-revalidate) for same-origin
 * assets for PWA / offline support. No hardcoded asset list — caching
 * happens on first fetch regardless of deployment layout.
 */

var CACHE_NAME = 'webchugl-v8';

// ── Install ─────────────────────────────────────────────────────────
self.addEventListener('install', function() { self.skipWaiting(); });

// ── Activate: clean old caches, claim clients ────────────────────────
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// ── Message handling ────────────────────────────────────────────────
self.addEventListener('message', function(ev) {
    if (!ev.data) return;
    // Only accept messages from same-origin clients
    if (ev.source && new URL(ev.source.url).origin !== self.location.origin) return;
    if (ev.data.type === 'deregister') {
        self.registration.unregister().then(function() {
            return self.clients.matchAll();
        }).then(function(clients) {
            clients.forEach(function(client) { client.navigate(client.url); });
        });
    }
});

// ── Fetch: COOP/COEP headers + dynamic caching ──────────────────────
self.addEventListener('fetch', function(event) {
    var r = event.request;

    if (r.method !== 'GET') return;

    // Chrome bug: only-if-cached with mode !== same-origin causes fetch to fail
    if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;

    // Don't intercept SSE / EventSource streams (causes CORS preflight issues)
    if (r.headers.get('accept') === 'text/event-stream') return;

    var isSameOrigin = new URL(r.url).origin === self.location.origin;

    // Only intercept same-origin requests. Cross-origin requests are left
    // to the browser, which handles credential stripping natively under
    // COEP credentialless. Intercepting them would break CORS proxies and
    // legitimate cross-origin fetches.
    if (!isSameOrigin) return;

    // Same-origin: stale-while-revalidate cache + COI headers
    event.respondWith(
        caches.match(r).then(function(cached) {
            if (cached) {
                // Serve from cache now, refresh in background
                fetch(r).then(function(response) {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(r, response);
                        });
                    }
                }).catch(function() {});
                return addCoiHeaders(cached);
            }

            // Not cached — fetch, cache, serve
            return fetch(r).then(function(response) {
                if (response.ok) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(r, clone);
                    });
                }
                return addCoiHeaders(response);
            });
        })
    );
});

// ── Helpers ──────────────────────────────────────────────────────────

function addCoiHeaders(response) {
    if (response.type === 'opaque' || response.type === 'opaqueredirect' || !response.headers) {
        return response;
    }

    var headers = new Headers(response.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
}
