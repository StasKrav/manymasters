import { initServices } from './services.js';
import { initMap } from './map.js';
import { initModal } from './modal.js';
import { initFilters } from './filters.js';
import { initPWA } from './pwa.js';
import { initMasterRegistration } from './master-registration.js';
import { initMapToggle } from './map-toggle.js';

// Глобальные переменные приложения
window.QuickFix = {
    version: '1.0.0',
    config: {
        city: 'Пермь',
        commissionRate: 0.15,
        defaultView: [58.01, 56.25],
        defaultZoom: 13
    },
    state: {
        currentService: null,
        filters: {
            search: '',
            category: 'Все услуги',
            price: 'Все цены'
        }
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log(`QuickFix v${window.QuickFix.version} запущен`);
    
    try {
        // Инициализируем модули
        initServices();
        initMap();
        initModal();
        initFilters();
        initPWA();
        initMasterRegistration();
        initMapToggle();
        // Загружаем мастеров с сервера при старте
                loadMastersFromServer();
                
                // Добавляем глобальные обработчики ошибок
                window.addEventListener('error', handleGlobalError);
                window.addEventListener('unhandledrejection', handlePromiseRejection);
                
                console.log('✅ Все модули инициализированы');
                
            } catch (error) {
                console.error('❌ Ошибка инициализации приложения:', error);
                showErrorToUser('Не удалось загрузить приложение. Пожалуйста, обновите страницу.');
            }

            
        });

// Загрузка мастеров с сервера
async function loadMastersFromServer() {
    try {
        const response = await fetch('http://localhost:3001/api/masters');
        if (response.ok) {
            const masters = await response.json();
            console.log(`📋 Загружено ${masters.length} мастеров с сервера`);
            
            // Можно сохранить в глобальное состояние
            window.QuickFix.masters = masters;
        }
    } catch (error) {
        console.warn('Не удалось загрузить мастеров с сервера:', error);
        // Это нормально при первом запуске, когда сервер еще не запущен
    }
}        

// Обработка глобальных ошибок
function handleGlobalError(event) {
    console.error('Глобальная ошибка:', event.error);
    // Можно отправить ошибку на сервер для анализа
    // sendErrorToAnalytics(event.error);
}

// Обработка необработанных промисов
function handlePromiseRejection(event) {
    console.error('Необработанный промис:', event.reason);
    event.preventDefault();
}

// Показ ошибки пользователю
function showErrorToUser(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="glass" style="position: fixed; top: 20px; right: 20px; padding: 1rem; background: #dc3545; color: white; border-radius: 8px; z-index: 9999;">
            <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
        </div>
    `;
    document.body.appendChild(errorDiv);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// 
// // В main.js или отдельном файле:
// function initMapToggle() {
//     const toggleBtn = document.getElementById('toggle-map-btn');
//     const mapContainer = document.getElementById('map');
//     const mapToggleText = document.getElementById('map-toggle-text');
//     
//     if (!toggleBtn || !mapContainer) return;
//     
//     // Начальное состояние - карта скрыта
//     let isMapVisible = false;
//     mapContainer.style.display = 'none';
//     
//     toggleBtn.addEventListener('click', function() {
//         isMapVisible = !isMapVisible;
//         
//         if (isMapVisible) {
//             mapContainer.style.display = 'block';
//             mapToggleText.textContent = 'Скрыть карту';
//             toggleBtn.innerHTML = '<i class="fas fa-map"></i> Скрыть карту';
//             
//             // Обновляем размер карты
//             setTimeout(() => {
//                 if (window.map) window.map.invalidateSize();
//                 // Показываем только мастеров с координатами
//                 updateMapMarkers();
//             }, 100);
//         } else {
//             mapContainer.style.display = 'none';
//             mapToggleText.textContent = 'Показать карту';
//             toggleBtn.innerHTML = '<i class="fas fa-map"></i> Показать карту';
//         }
//     });

// 
// // Функция для обновления маркеров (только с координатами)
// function updateMapMarkers() {
//     if (!window.map || !window.services) return;
//     
//     // Очищаем старые маркеры
//     if (window.markers) {
//         window.markers.forEach(marker => window.map.removeLayer(marker));
//     }
//     
//     // Добавляем только мастеров с hasLocation = true
//     const mastersWithLocation = window.services.filter(s => s.hasLocation === true);
//     
//     window.markers = mastersWithLocation.map(service => {
//         const marker = L.marker([service.lat, service.lng])
//             .addTo(window.map)
//             .bindPopup(`
//                 <b>${service.master}</b><br>
//                 ${service.category}<br>
//                 ${service.price}₽ • ${service.rating}⭐
//             `);
//         
//         return marker;
//     });
// }

