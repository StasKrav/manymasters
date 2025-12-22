let map = null;
let markers = [];

// Инициализация карты
export function initMap() {
    console.log('Map module initialized');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Создаем карту
    map = L.map('map').setView([58.01, 56.25], 13);
    
    // Добавляем слой OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);
    
    // Добавляем обработчик событий для обновления маркеров
    window.addEventListener('servicesRendered', (event) => {
        updateMarkers(event.detail || window.services || []);
    });
    
    // Слушаем событие выбора услуги для центрирования карты
    window.addEventListener('serviceSelected', (event) => {
        const service = event.detail;
        if (service && service.lat && service.lng) {
            centerMapOnService(service);
        }
    });
}

// Добавление маркеров на карту
function updateMarkers(services) {
    // Очищаем старые маркеры
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Добавляем новые маркеры
    services.forEach(service => {
        if (service.lat && service.lng) {
            const marker = L.marker([service.lat, service.lng])
                .addTo(map)
                .bindPopup(`
                    <b>${service.name}</b><br>
                    ${service.master}<br>
                    ${service.price}₽ • ${service.rating}⭐
                `);
            
            markers.push(marker);
            
            // Добавляем обработчик клика на маркер
            marker.on('click', () => {
                window.dispatchEvent(new CustomEvent('serviceSelected', { 
                    detail: service 
                }));
            });
        }
    });
}

// Центрирование карты на услуге
function centerMapOnService(service) {
    if (!map || !service.lat || !service.lng) return;
    
    map.setView([service.lat, service.lng], 16);
    
    // Открываем попап маркера
    markers.forEach(marker => {
        const latLng = marker.getLatLng();
        if (latLng.lat === service.lat && latLng.lng === service.lng) {
            marker.openPopup();
        }
    });
}

// Показать/скрыть карту
export function showMap() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.display = 'block';
        // Обновляем размер карты
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 100);
    }
}

export function hideMap() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.display = 'none';
    }
}
