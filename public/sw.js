// Asmae Radio - Enhanced Service Worker for PWA Builder Compatibility
const CACHE_VERSION = 'asmae-radio-v11';
const STATIC_CACHE = 'asmae-static-v11';
const DYNAMIC_CACHE = 'asmae-dynamic-v11';
const IMAGE_CACHE = 'asmae-images-v11';
const API_CACHE = 'asmae-api-v11';

// Core static assets to cache immediately
const CORE_ASSETS = [
  '/',
  '/manifest.json',
];

// Static assets patterns to cache on first request
const STATIC_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\/_next\/static\//,
];

// Image patterns
const IMAGE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
];

// API patterns to cache with Network First
const API_PATTERNS = [
  /\/api\/radio/,
  /\/api\/station/,
  /\/api\/quran/,
  /\/api\/user/,
];

// Never cache these - Ads, streams, real-time data
const NEVER_CACHE = [
  /\/api\/notifications/,
  /\/api\/stream/,
  /\/api\/chat/,
  /\/api\/ai/,
  /\/api\/voice/,
  /chrome-extension:/,
  /\/_next\/image\?/,
  // Audio/Video streams
  /\.m3u$/,
  /\.pls$/,
  /stream\./,
  /workers\.dev/,
  /\.mp3$/,
  /\.aac$/,
  /\.ogg$/,
  /\.flac$/,
  /audio\//,
  /video\//,
  // External ad networks - NEVER cache ads (critical for monetization)
  /plasticdamage\.com/,
  /webbedtrash\.com/,
  /highperformanceformat\.com/,
  /profitablecpmratenetwork\.com/,
  /adsterra\.com/,
  /googleads\.com/,
  /doubleclick\.net/,
  /googlesyndication\.com/,
  /googleadservices\.com/,
  /adsserver\.com/,
  /adservice\.google/,
  /pagead2\.googlesyndication\.com/,
  /ads\.twitter\.com/,
  /an\.yandex\.ru/,
  /ad\.doubleclick\.net/,
  /static\.ads-twitter\.com/,
  /analytics\.google\.com/,
  /www\.googletagmanager\.com/,
  /tsyndicate\.com/,
  /cdn\.tsyndicate\.com/,
  /pagead2\.googlesyndication\.com/,
  /adsbygoogle\.com/,
];

// ==================== INSTALL ====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v11...');

  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ]).catch((error) => {
      console.error('[SW] Install failed:', error);
    })
  );
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v11...');

  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== STATIC_CACHE &&
                     name !== DYNAMIC_CACHE &&
                     name !== IMAGE_CACHE &&
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Claim all clients immediately
      self.clients.claim(),
    ])
  );
});

// ==================== FETCH STRATEGIES ====================

// Cache First - for static assets
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First - for API calls
async function networkFirst(request, cacheName = API_CACHE) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: true,
        offline: true,
        message: 'لا يوجد اتصال بالإنترنت'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale While Revalidate - for images
async function staleWhileRevalidate(request, cacheName = IMAGE_CACHE) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Start network fetch in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  // Return cached or wait for network
  return cachedResponse || fetchPromise;
}

// Network Only - for non-cacheable requests
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ==================== FETCH HANDLER ====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // CRITICAL: Skip ALL cross-origin requests (ads, analytics, etc.)
  // This ensures ads work properly without SW interference
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip never-cache patterns
  if (NEVER_CACHE.some(pattern => pattern.test(url.href))) {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // Return cached main page instead of separate offline page
        return caches.match('/');
      })
    );
    return;
  }

  // Handle API requests
  if (API_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle image requests
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Handle static assets
  if (STATIC_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  // Get the base URL for icons
  const baseUrl = self.location.origin;

  let notificationData = {
    title: 'اسمع راديو',
    body: 'لديك إشعار جديد',
    icon: `${baseUrl}/icons/icon-192x192.png`,
    badge: `${baseUrl}/icons/badge-monochrome.png`,
    image: `${baseUrl}/icons/icon-512x512.png`,
    tag: 'default',
    data: {},
    actions: [],
  };

  if (event.data) {
    try {
      const data = event.data.json();
      // Ensure icon and badge are absolute URLs
      if (data.icon && !data.icon.startsWith('http')) {
        data.icon = `${baseUrl}${data.icon}`;
      }
      if (data.badge && !data.badge.startsWith('http')) {
        data.badge = `${baseUrl}${data.badge}`;
      }
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: notificationData.actions,
    vibrate: [100, 50, 100],
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar',
    renotify: true,
  };

  event.waitUntil(
    Promise.all([
      // Show the notification to the user
      self.registration.showNotification(notificationData.title, options)
        .then(() => {
          // Track notification if historyId exists (sent from Radio app API)
          if (notificationData.data?.historyId) {
            return fetch('/api/notifications/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                historyId: notificationData.data.historyId,
                event: 'opened',
              }),
            });
          }
        })
        .catch(err => console.error('[SW] Notification error:', err)),
      // Save notification to server history so it appears in the bell dropdown
      // This handles notifications sent from ANY source (admin site, external, etc.)
      self.registration.pushManager.getSubscription().then(subscription => {
        if (!subscription) return null;
        return fetch('/api/notifications/received', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            title: notificationData.title,
            body: notificationData.body,
            icon: notificationData.icon,
            tag: notificationData.tag,
            data: notificationData.data || {},
          }),
        }).then(() => {
          // Notify all open tabs to refresh their notification count
          return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            clients.forEach(client => {
              client.postMessage({ type: 'NOTIFICATION_RECEIVED', title: notificationData.title });
            });
          });
        }).catch(err => console.error('[SW] Failed to save notification to history:', err));
      }),
    ])
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.deepLink || '/';

  // Handle action clicks
  if (event.action === 'play' && data.stationId) {
    targetUrl = `/station/${data.stationId}?play=true`;
  } else if (event.action === 'dismiss') {
    return;
  }

  // Track click
  if (data.historyId) {
    event.waitUntil(
      fetch('/api/notifications/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId: data.historyId,
          event: 'clicked',
        }),
      }).catch(() => {})
    );
  }

  // Open/focus app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if ('navigate' in client) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ==================== MESSAGE HANDLING ====================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  const { type, data } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
      break;

    case 'CACHE_URLS':
      if (data?.urls) {
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.addAll(data.urls);
        });
      }
      break;

    case 'GET_CACHE_STATUS':
      caches.keys().then(async (names) => {
        const sizes = await Promise.all(
          names.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            return { name, count: keys.length };
          })
        );
        event.source?.postMessage({ type: 'CACHE_STATUS', caches: sizes });
      });
      break;

    case 'SHOW_NOTIFICATION':
      if (data?.title) {
        const baseUrl = self.location.origin;
        self.registration.showNotification(data.title, {
          icon: `${baseUrl}/icons/icon-192x192.png`,
          badge: `${baseUrl}/icons/badge-monochrome.png`,
          image: `${baseUrl}/icons/icon-512x512.png`,
          dir: 'rtl',
          lang: 'ar',
          ...data.options,
        });
      }
      break;
  }
});

// ==================== BACKGROUND SYNC ====================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // Sync favorites when back online
  console.log('[SW] Syncing favorites...');
  // Implementation would sync with server
}

// ==================== NETWORK STATUS ====================

self.addEventListener('online', () => {
  console.log('[SW] Back online');
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'NETWORK_STATUS', online: true });
    });
  });
});

self.addEventListener('offline', () => {
  console.log('[SW] Gone offline');
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'NETWORK_STATUS', online: false });
    });
  });
});

console.log('[SW] Service Worker loaded - Asmae Radio PWA v11');
