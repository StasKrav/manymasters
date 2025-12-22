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
        
        // В services.js в renderServices обновляем шаблон карточки:
        
        return `
        <div class="service-card glass" data-id="${service.id}">
            <div class="service-card__content">
                <div class="master-avatar" style="...">
                    ${initial}
                </div>
                <div class="service-card__info">
                    <h3 class="service-card__name">${service.master}</h3>
                    <p class="service-card__service">${service.category}</p>
                    
                    <!-- Блок локации -->
                    <div class="service-card__location">
                        ${service.workType === 'stationary' || service.workType === 'both' 
                            ? `<span class="location-badge stationary">
                                 <i class="fas fa-home"></i> Принимает у себя
                               </span>`
                            : `<span class="location-badge mobile">
                                 <i class="fas fa-car"></i> Выездной
                               </span>`
                        }
                        
                        ${service.experience 
                            ? `<span class="experience-badge">
                                 <i class="fas fa-award"></i> ${service.experience}
                               </span>`
                            : ''
                        }
                    </div>
                    
                    ${service.districts && service.districts.length > 0 && service.districts[0] !== 'all'
                        ? `<div class="districts">
                             <small><i class="fas fa-map-marker-alt"></i> 
                             ${service.districts.join(', ')}</small>
                           </div>`
                        : ''
                    }
                    
                    <div class="service-card__meta">
                        <span class="service-card__rating">${service.rating.toFixed(1)} ⭐</span>
                        <span class="service-card__time">
                            <i class="fas fa-clock"></i>
                            ${service.time}
                        </span>
                    </div>
                </div>
                <div class="service-card__price">
                    <div class="service-card__price-value">${service.price}₽</div>
                    ${service.premium ? '<div class="service-card__badge">PREMIUM</div>' : ''}
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
