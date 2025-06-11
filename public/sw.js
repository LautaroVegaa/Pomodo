
const CACHE_NAME = 'pomodo-v2';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/favicon.ico'
];

// Instalar el service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Error during cache setup:', error);
      })
  );
  // Activar inmediatamente el nuevo service worker
  self.skipWaiting();
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediatamente de todas las páginas
  self.clients.claim();
});

// Interceptar solicitudes de red
self.addEventListener('fetch', (event) => {
  // Solo cachear solicitudes GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta cacheada
        if (response) {
          return response;
        }
        
        // No está en cache - hacer solicitud de red
        return fetch(event.request)
          .then((response) => {
            // Verificar si es una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar respuesta para cachear
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Red no disponible - devolver página offline si está disponible
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync para funcionalidad offline
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Función para sincronizar datos cuando se recupere la conexión
function doBackgroundSync() {
  console.log('Performing background sync...');
  return new Promise((resolve) => {
    // Aquí se puede implementar sincronización de datos cuando se recupere la conexión
    // Por ejemplo, sincronizar estadísticas del pomodoro guardadas localmente
    
    // Verificar si hay datos pendientes de sincronizar
    const pendingData = localStorage.getItem('pending-sync-data');
    if (pendingData) {
      console.log('Found pending sync data');
      // Procesar datos pendientes aquí
      // Una vez procesado, eliminar de localStorage
      // localStorage.removeItem('pending-sync-data');
    }
    
    resolve();
  });
}

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Pomodō',
    body: 'Notificación del temporizador',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,
      tag: 'pomodoro-notification'
    })
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
