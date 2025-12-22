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
// В services.js в renderServices убираем всё про локацию:

function renderServices(servicesList = services) {
    console.log("🎨 Рендерим " + servicesList.length + " услуг");
    
    const container = document.getElementById('services');
    if (!container) return;
    
    if (servicesList.length === 0) {
        container.innerHTML = '<div class="no-results glass">Нет мастеров</div>';
        return;
    }
    
    container.innerHTML = servicesList.map(service => {
        const initial = getInitials(service.master);
        const bgColor = getAvatarColor(service.master);
        
        // В renderServices() должна быть правильная разметка:
        return `
        <div class="service-card glass" data-id="${service.id}">
            <div class="service-card__content">
                <div class="master-avatar" style="background: ${bgColor};">
                    ${initial}
                </div>
                <div class="service-card__info">
                    <h3 class="service-card__name">${service.master}</h3>
                    <p class="service-card__service">${service.category}</p>
                    
                    <div class="service-card__meta">
                        ${service.workType === 'stationary' 
                            ? '<span class="work-type-badge"><i class="fas fa-home"></i> Принимает у себя</span>'
                            : '<span class="work-type-badge"><i class="fas fa-car"></i> Выездной</span>'
                        }
                        <span class="service-card__rating">${service.rating.toFixed(1)} ⭐</span>
                        <span class="service-card__time">
                            <i class="fas fa-clock"></i> ${service.time}
                        </span>
                    </div>
                    
                    ${service.description 
                        ? `<p class="service-card__description">${service.description}</p>`
                        : ''
                    }
                </div>
                <div class="service-card__price">
                    <div class="service-card__price-value">${service.price}₽</div>
                </div>
            </div>
        </div>
        `;
    }).join('');
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
