// map-toggle.js
// map-toggle.js - ИСПРАВЛЕННЫЙ КОД
export function initMapToggle() {
    console.log('=== ПЕРЕКЛЮЧАТЕЛЬ КАРТЫ ===');
    
    // Даем время на полную инициализацию карты
    setTimeout(() => {
        const btn = document.getElementById('toggle-map-btn');
        const map = document.getElementById('map');
        
        console.log('Найдено:', {
            кнопка: !!btn,
            карта: !!map,
            картаВидима: map ? map.style.display : 'нет'
        });
        
        if (!btn || !map) {
            console.error('Не найдены необходимые элементы');
            return;
        }
        
        // 1. СНАЧАЛА СКРЫВАЕМ КАРТУ
        map.style.display = 'none';
        console.log('Карта скрыта');
        
        // 2. УСТАНАВЛИВАЕМ ОБРАБОТЧИК
        btn.addEventListener('click', function toggleMap() {
            console.log('Клик! Текущий display:', map.style.display);
            
            if (map.style.display === 'none') {
                // ПОКАЗАТЬ
                map.style.display = 'block';
                this.innerHTML = '<i class="fas fa-eye-slash"></i> Скрыть карту';
                console.log('Карта показана');
                
                // Обновляем размер Leaflet карты
                setTimeout(() => {
                    if (window.map && typeof window.map.invalidateSize === 'function') {
                        console.log('Обновляем размер карты...');
                        window.map.invalidateSize();
                    }
                }, 100);
                
            } else {
                // СКРЫТЬ
                map.style.display = 'none';
                this.innerHTML = '<i class="fas fa-map"></i> Показать карту';
                console.log('Карта скрыта');
            }
        });
        
        console.log('✅ Переключатель карты готов. Нажмите кнопку!');
        
    }, 1000); // Ждем 1 секунду для полной инициализации
}
// Проверяем, есть ли вообще мастера с координатами
function checkIfAnyMarkers() {
    setTimeout(() => {
        if (window.services && Array.isArray(window.services)) {
            const mastersWithLocation = window.services.filter(s => 
                s.hasLocation === true || (s.lat && s.lng)
            );
            
            const toggleBtn = document.getElementById('toggle-map-btn');
            if (toggleBtn) {
                if (mastersWithLocation.length === 0) {
                    toggleBtn.disabled = true;
                    toggleBtn.title = 'Нет мастеров с указанным адресом';
                    toggleBtn.innerHTML = '<i class="fas fa-map"></i> Нет адресов';
                } else {
                    toggleBtn.disabled = false;
                    toggleBtn.title = '';
                }
            }
        }
    }, 1000);
}

// Обновляем маркеры на карте
function updateMapMarkers() {
    if (!window.map || !window.services) return;
    
    // Очищаем старые маркеры
    if (window.markers && Array.isArray(window.markers)) {
        window.markers.forEach(marker => {
            if (marker && marker.remove) {
                window.map.removeLayer(marker);
            }
        });
    }
    
    // Фильтруем мастеров: только те, у кого есть координаты
    const mastersWithLocation = window.services.filter(service => 
        service.hasLocation === true || (service.lat && service.lng)
    );
    
    console.log(`📍 Показать на карте: ${mastersWithLocation.length} мастеров`);
    
    // Создаем новые маркеры
    window.markers = mastersWithLocation.map(service => {
        const marker = L.marker([service.lat, service.lng])
            .addTo(window.map)
            .bindPopup(`
                <div class="map-popup">
                    <b>${service.master || 'Мастер'}</b><br>
                    <small>${service.category || 'Услуги'}</small><br>
                    <strong>${service.price || '0'}₽</strong> • ⭐ ${service.rating?.toFixed(1) || '5.0'}
                    ${service.address ? `<br><small>${service.address}</small>` : ''}
                </div>
            `);
        
        // Клик по маркеру - выбор услуги
        marker.on('click', () => {
            window.dispatchEvent(new CustomEvent('serviceSelected', { 
                detail: service 
            }));
        });
        
        return marker;
    });
}

// Центрируем карту на видимых маркерах
function centerMapOnMarkers() {
    if (!window.map || !window.markers || window.markers.length === 0) return;
    
    // Если есть маркеры, центрируем на них
    if (window.markers.length === 1) {
        const marker = window.markers[0];
        const latLng = marker.getLatLng();
        window.map.setView([latLng.lat, latLng.lng], 14);
        marker.openPopup();
    } else if (window.markers.length > 1) {
        // Группа маркеров
        const group = new L.featureGroup(window.markers);
        window.map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Экспортируем функцию
export { updateMapMarkers };
