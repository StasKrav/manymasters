// Импортируем данные из отдельного файла
import servicesData from './services-data.js';

// Экспортируем данные для других модулей
export const services = servicesData;

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
    console.log("🎨 Рендерим " + servicesList.length + " услуг");
    
    const container = document.getElementById('services');
    if (!container) {
        console.error('❌ Контейнер услуг не найден!');
        return;
    }
    
    if (servicesList.length === 0) {
        container.innerHTML = '<div class="no-results glass">Нет мастеров</div>';
        return;
    }
    
    container.innerHTML = servicesList.map(service => {
        // Получаем инициал
        const initial = getInitials(service.master);
        const bgColor = getAvatarColor(service.master);
        
        return `
        <div class="service-card glass" data-id="${service.id}">
            <div class="service-card__content">
                <div class="master-avatar" style="
                    background-color: ${bgColor};
                    color: white;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                    margin-right: 12px;
                ">
                    ${initial}
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
                    ${service.price > 0 ? 'от ' + service.price + '₽' : 'Цена по запросу'}
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // 🔥 ВАЖНО: Вешаем обработчики кликов
    container.querySelectorAll('.service-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-id');
            const service = servicesList.find(s => s.id === serviceId);
            
            if (service) {
                console.log('🖱️ Клик по карточке:', service.master);
                
                window.dispatchEvent(new CustomEvent('serviceSelected', {
                    detail: service
                }));
            }
        });
    });
    
    console.log("✅ Обработчики кликов добавлены на " + servicesList.length + " карточек");
}

// Инициализация услуг
export function initServices() {
    console.log('Services module initialized');
    
    // Сразу рендерим
    renderServices();
    
    // Экспортируем функцию для других модулей
    window.renderServices = renderServices;
    window.services = services;
}
