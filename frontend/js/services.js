// Данные услуг
export const services = [];

// Функция для получения инициалов
function getInitials(fullName) {
    if (!fullName || typeof fullName !== 'string') return 'М';
    const names = fullName.split(' ').filter(n => n.trim() !== '');
    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : 'М';
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
