// services.js - ВЕРНИ ЭТУ ПРОСТУЮ ВЕРСИЮ:
import servicesData from './services-data.js';

// 1. ЭТА СТРОКА ОБЯЗАТЕЛЬНА:
export const services = servicesData;

// Функция для получения инициалов мастера
function getInitials(masterName) {
    if (!masterName || typeof masterName !== 'string') return '?';
    const firstName = masterName.trim().split(' ')[0];
    const initial = firstName.charAt(0).toUpperCase();
    return /[А-ЯЁA-Z]/.test(initial) ? initial : '?';
}

// Функция для цвета аватарки
function getAvatarColor(name) {
    if (!name) return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    const colors = [
        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #ef4444, #dc2626)'
    ];
    const index = name.length % colors.length;
    return colors[index];
}

// Рендеринг услуг - ПРОСТАЯ ВЕРСИЯ
function renderServices(servicesList = services) {
    console.log("🎨 Рендерим " + servicesList.length + " услуг");
    
    const container = document.getElementById('services');
    if (!container) return;
    
    if (servicesList.length === 0) {
        container.innerHTML = '<div class="no-results glass">Нет мастеров</div>';
        return;
    }
    
    // ГЕНЕРИРУЕМ HTML
    container.innerHTML = servicesList.map(service => {
        const initial = getInitials(service.master);
        const bgColor = getAvatarColor(service.master);
        const rating = service.rating ? service.rating.toFixed(1) : '4.5';
        const reviewsCount = service.reviewsCount || Math.floor(Math.random() * 50) + 1;
        const price = service.price ? `${service.price}₽` : 'Цена не указана';
        const workTypeText = service.workType === 'stationary' ? 'Принимает у себя' : 'Выездной';
        
        return `
        <div class="master-card glass" data-id="${service.id}">
            <div class="card-top">
                <div class="master-avatar" style="background: ${bgColor};">
                    ${initial}
                </div>
                <div class="master-info">
                    <h3 class="master-name">${service.master}</h3>
                    <p class="master-category">${service.category}</p>
                </div>
            </div>
            
            <div class="card-description">
                <p>${service.description || 'Мастер не добавил описание'}</p>
            </div>
            
            <div class="card-meta">
                <span class="meta-item">
                    <i class="fas fa-star"></i>
                    ${rating} (${reviewsCount})
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                    <i class="fas fa-tag"></i>
                    ${price}
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                    ${workTypeText}
                </span>
            </div>
            
            <div class="card-actions">
                <button class="btn-view" data-id="${service.id}">
                    <i class="fas fa-eye"></i>
                    Посмотреть
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    // ВЕШАЕМ ОБРАБОТЧИКИ ПРЯМО ЗДЕСЬ
    container.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const serviceId = this.getAttribute('data-id');
            const service = servicesList.find(s => s.id === serviceId);
            if (service && window.openModal) {
                window.openModal(service);
            }
        });
    });
    
    container.querySelectorAll('.master-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-view')) {
                const serviceId = this.getAttribute('data-id');
                const service = servicesList.find(s => s.id === serviceId);
                if (service && window.openModal) {
                    window.openModal(service);
                }
            }
        });
    });
    
    console.log("✅ Карточки отрендерены");
}

// Инициализация услуг - ПРОСТАЯ ВЕРСИЯ
export function initServices() {
    console.log('Services module initialized');
    
    // ИСПОЛЬЗУЕМ ЛОКАЛЬНЫЕ ДАННЫЕ
    window.services = services;
    
    // Рендерим
    renderServices();
    
    // Экспортируем функцию
    window.renderServices = renderServices;
    
    console.log('✅ Services инициализированы, телефоны:', services[0]?.phone);
}
