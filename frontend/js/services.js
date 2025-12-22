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
    if (!name) return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    
    const colors = [
        'linear-gradient(135deg, #3b82f6, #1d4ed8)', // синий
        'linear-gradient(135deg, #10b981, #059669)', // зеленый
        'linear-gradient(135deg, #8b5cf6, #7c3aed)', // фиолетовый
        'linear-gradient(135deg, #f59e0b, #d97706)', // оранжевый
        'linear-gradient(135deg, #ef4444, #dc2626)'  // красный
    ];
    
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
        // Получаем инициал и цвет
        const initial = getInitials(service.master);
        const bgColor = getAvatarColor(service.master);
        
        // Мета-информация в одну строку
        const rating = service.rating ? service.rating.toFixed(1) : '4.5';
        const reviewsCount = service.reviewsCount || Math.floor(Math.random() * 50) + 1; // временно
        const price = service.price ? `${service.price}₽` : 'Цена не указана';
        const workTypeIcon = service.workType === 'stationary' ? '' : '';
        const workTypeText = service.workType === 'stationary' ? 'Принимает у себя' : 'Выездной';
        
        return `
        <div class="master-card glass" data-id="${service.id}">
            <!-- Аватар и имя -->
            <div class="card-top">
                <div class="master-avatar" style="background: ${bgColor};">
                    ${initial}
                </div>
                <div class="master-info">
                    <h3 class="master-name">${service.master}</h3>
                    <p class="master-category">${service.category}</p>
                </div>
            </div>
            
            <!-- Описание мастера -->
            <div class="card-description">
                <p>${service.description || 'Мастер не добавил описание'}</p>
            </div>
            
            <!-- Вся мета-инфо в одну строку -->
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
                    ${workTypeIcon}
                    ${workTypeText}
                </span>
            </div>
            
            <!-- Кнопка "Посмотреть" -->
            <div class="card-actions">
                <button class="btn-view" data-id="${service.id}">
                    <i class="fas fa-eye"></i>
                    Посмотреть
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    // Вешаем обработчики на кнопки
    container.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const serviceId = this.getAttribute('data-id');
            const service = servicesList.find(s => s.id === serviceId);
            if (service) openModal(service);
        });
    });
    
    // Вешаем на всю карточку
    container.querySelectorAll('.master-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-view')) {
                const serviceId = this.getAttribute('data-id');
                const service = servicesList.find(s => s.id === serviceId);
                if (service) openModal(service);
            }
        });
    });
    
    console.log("✅ Карточки отрендерены");
}

// Функция открытия модалки (добавь если нет)
function openModal(service) {
    console.log('📱 Открываем модалку для:', service.master);
    // Здесь код открытия модалки
    if (window.openModal) {
        window.openModal(service);
    }
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
