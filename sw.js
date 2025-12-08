// sw.js

// Listener for the install event - caching logic is commented out for now.
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    // We keep caching logic commented out to simplify the serverless deployment model for now
    self.skipWaiting(); // Activate worker immediately
});

// Listener for the activate event.
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(clients.claim()); // Become available to all pages
});


// Listener for push events from the server (Enhanced for AfferioIQ data).
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push Received.');

    let data = {};
    try {
        // Parse the data sent from your dashboard/server.
        data = event.data.json();
    } catch (e) {
        // Fallback for plain text or unexpected data structure
        console.error("Push data parsing error:", e);
    }
    
    // Default and Options based on the data received
    const title = data.title || 'New Update from AfferioIQ Client';
    const options = {
        body: data.body || 'Check your branded utility tool for a new message.',
        icon: data.icon || './icon-192x192.png', // Fallback
        badge: data.badge || './icon-96x96.png', // Fallback
        
        // CRITICAL: Store the link URL so we can open the app to a specific page or offer.
        data: {
            url: data.link || '/' 
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});


// Listener for notification click events (Enhanced for deep linking).
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked.');
    event.notification.close();

    const targetUrl = event.notification.data.url || '/';

    // Focus an existing client window or open a new one at the target URL.
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                // Check if the client is already open and focus it
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open a new window with the specific URL
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
