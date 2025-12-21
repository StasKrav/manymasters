// frontend/js/pwa.js
export function initPWA() {
    console.log('PWA module initialized');
    
    // ВРЕМЕННО ОТКЛЮЧАЕМ SERVICE WORKER
    console.log('Service Worker отключен для разработки');
    
    // Можно оставить уведомления
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Разрешение на уведомления:', permission);
        });
    }
    
    // Добавим кнопку установки PWA позже
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Приложение запущено как PWA');
    }
}
