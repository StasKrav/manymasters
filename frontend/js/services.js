// Данные услуг (генерируются из мастеров)
export const services = [
  {
    "id": "master_1766322085343",
    "name": "м",
    "category": "Другое",
    "price": 1000,
    "master": "Станислав",
    "rating": 4.595186298921034,
    "time": "30 мин",
    "lat": 58.008128471749984,
    "lng": 56.258831436223076,
    "premium": false,
    "avatar": "👨‍🔧"
  },
  {
    "id": "master_1766322683629",
    "name": "с",
    "category": "Сантехника",
    "price": 1000,
    "master": "Стас",
    "rating": 4.611401183259944,
    "time": "30 мин",
    "lat": 58.01432625676267,
    "lng": 56.24633857693399,
    "premium": false,
    "avatar": "👨‍🔧"
  },
  {
    "id": "master_1766325332258",
    "name": "m",
    "category": "Другое",
    "price": 1500,
    "master": "stas",
    "rating": 4.886331810534287,
    "time": "30 мин",
    "lat": 58.013817334960805,
    "lng": 56.244279001802504,
    "premium": false,
    "avatar": "👨‍🔧"
  }
];

// Функция для получения инициалов мастера
function getInitials(masterName) {
    if (!masterName || typeof masterName !== 'string') return '?';
    
    // Берем первое слово (имя) и первую букву
    const firstName = masterName.trim().split(' ')[0];
    const initial = firstName.charAt(0).toUpperCase();
    
    return /[А-ЯЁA-Z]/.test(initial) ? initial : '?';
}

// Функция для цвета аватарки (на основе имени)
function getAvatarColor(name) {
    if (!name) return '#3B82F6';
    
    const colors = [
        '#3B82F6', // синий
        '#10B981', // зеленый
        '#8B5CF6', // фиолетовый
        '#F59E0B', // оранжевый
        '#EF4444', // красный
        '#EC4899'  // розовый
    ];
    
    // Используем длину имени для детерминированного выбора цвета
    const index = name.length % colors.length;
    return colors[index];
}
// Рендеринг услуг
function renderServices(servicesList = services) {
    console.log(`🎨 Рендерим ${servicesList.length} услуг`);
    
    const container = document.getElementById('services');
    if (!container) {
        console.error('❌ Контейнер услуг не найден!');
        return;
    }
    
    if (servicesList.length === 0) {
        container.innerHTML = '<div class="no-results glass">Нет мастеров</div>';
        return;
    }
    
    container.innerHTML = servicesList.map(service => `
        <div class="service-card glass" data-id="${service.id}">
            <div class="service-card__content">
                <div class="master-avatar">
                    ${getInitials(service.master)}
                </div>
                <div class="service-card__info">
                    <h3 class="service-card__name">${service.master}</h3>
                    <p class="service-card__service">${service.category}</p>
                    <div class="service-card__rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span class="reviews-count">(0)</span>
                    </div>
                </div>
                <div class="service-card__price">
                    ${service.price > 0 ? `от ${service.price}₽` : 'Цена по запросу'}
                </div>
            </div>
        </div>
    `).join('');
    
    // 🔥 ВАЖНО: Вешаем обработчики кликов
    container.querySelectorAll('.service-card').forEach(card => {
        card.style.cursor = 'pointer'; // Покажем что кликабельно
        card.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-id');
            const service = servicesList.find(s => s.id === serviceId);
            
            if (service) {
                console.log('🖱️ Клик по карточке:', service.master);
                
                // Отправляем событие для модалки
                window.dispatchEvent(new CustomEvent('serviceSelected', {
                    detail: service
                }));
            }
        });
    });
    
    console.log(`✅ Обработчики кликов добавлены на ${servicesList.length} карточек`);
}
// Тестовые данные
function getTestData() {
    return [
        { id: 1, master: 'Тест 1', category: 'Сантехник', price: 1500 },
        { id: 2, master: 'Тест 2', category: 'Электрик', price: 2000 }
    ];
}

// Загрузка с сервера
async function loadServicesFromServer() {
    try {
        console.log('🔄 Загрузка мастеров с сервера...');
        
        const response = await fetch('http://localhost:3001/api/masters');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const masters = await response.json();
        console.log(`📥 Получено ${masters.length} мастеров`);
        
        const activeMasters = masters.filter(m => m.status === 'active');
        console.log(`✅ Активных мастеров: ${activeMasters.length}`);
        
        // Конвертируем ВСЕХ активных
        const convertedServices = activeMasters.map((master, index) => {
            // Услуга
            const serviceText = master.services 
                ? master.services.split(',')[0].trim()
                : (master.categories?.[0] || 'Услуги');
            
            return {
                id: master.id || `master_${index}`,
                master: master.name || 'Мастер',
                category: serviceText,
                price: master.price || 0, // может быть 0
                rating: 4.5,
                reviewsCount: 0
            };
        });
        
        console.log(`🔄 Сконвертировано ${convertedServices.length} услуг`);
        
        // Обновляем массив
        services.length = 0;
        services.push(...convertedServices);
        
        // Глобально доступно
        window.services = services;
        
        console.log(`🎯 window.services теперь содержит ${window.services.length} элементов`);
        
        // Рендерим
        renderServices();
        
        console.log('✅ Данные загружены и отображены');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        
        // Только если совсем пусто
        if (services.length === 0) {
            console.log('🔄 Используем тестовые данные...');
            const testData = getTestData();
            services.length = 0;
            services.push(...testData);
            window.services = services;
            renderServices();
        }
    }
}

// Инициализация
export function initServices() {
    console.log('Services module initialized');
    loadServicesFromServer();
    window.renderServices = renderServices;
    window.services = services;
}
