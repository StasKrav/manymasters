import { services } from './services.js';

// Инициализация фильтров и поиска
export function initFilters() {
    console.log('Filters module initialized');
    
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const priceSelect = document.getElementById('price');
    const filterBtn = document.getElementById('filter-btn');
    
    if (!searchInput || !categorySelect || !priceSelect || !filterBtn) return;
    
    // Поиск по вводу
    searchInput.addEventListener('input', handleSearch);
    
    // Фильтрация по кнопке
    filterBtn.addEventListener('click', applyFilters);
    
    // Фильтрация при изменении селектов
    categorySelect.addEventListener('change', applyFilters);
    priceSelect.addEventListener('change', applyFilters);
    
    // Инициализируем первый рендер
    applyFilters();
}

// Обработка поиска
// Обработка поиска
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!window.services || !Array.isArray(window.services)) {
        console.error('❌ window.services не массив или не существует');
        return;
    }
    
    if (searchTerm === '') {
        applyFilters();
        return;
    }
    
    // БЕЗОПАСНАЯ фильтрация
    const filtered = window.services.filter(service => {
        if (!service) return false;
        
        // Берем все текстовые поля
        const searchableFields = [
            service.name,
            service.master,
            service.category,
            service.services
        ].filter(field => field && typeof field === 'string');
        
        // Ищем в любом поле
        return searchableFields.some(field => 
            field.toLowerCase().includes(searchTerm)
        );
    });
    
    renderFilteredServices(filtered);
}

// Применение фильтров
function applyFilters() {
    const searchTerm = document.getElementById('search')?.value?.toLowerCase().trim() || '';
    const selectedCategory = document.getElementById('category')?.value || 'Все услуги';
    const selectedPrice = document.getElementById('price')?.value || 'Все цены';
    
    if (!window.services || !Array.isArray(window.services)) {
        console.error('❌ Нет данных для фильтрации');
        return;
    }
    
    let filtered = [...window.services];
    
    // 1. Фильтр по поиску (с защитой)
    if (searchTerm) {
        filtered = filtered.filter(service => {
            if (!service) return false;
            
            const name = service.name || '';
            const master = service.master || '';
            const category = service.category || '';
            const services = service.services || '';
            
            return name.toLowerCase().includes(searchTerm) ||
                   master.toLowerCase().includes(searchTerm) ||
                   category.toLowerCase().includes(searchTerm) ||
                   services.toLowerCase().includes(searchTerm);
        });
    }
    
    // 2. Фильтр по категории
    if (selectedCategory !== 'Все услуги') {
        const category = selectedCategory.replace(/[🚿⚡🔨🧹🚚✨]/g, '').trim();
        filtered = filtered.filter(service => 
            service && service.category && service.category.includes(category)
        );
    }
    
    // 3. Фильтр по цене
    if (selectedPrice !== 'Все цены') {
        filtered = filtered.filter(service => {
            if (!service || service.price === undefined || service.price === null) {
                return selectedPrice === 'До 1000₽'; // услуги без цены попадают в "до 1000"
            }
            
            const price = Number(service.price);
            
            switch (selectedPrice) {
                case 'До 1000₽': return price <= 1000;
                case '1000-3000₽': return price > 1000 && price <= 3000;
                case '3000₽+': return price > 3000;
                default: return true;
            }
        });
    }
    
    renderFilteredServices(filtered);
}

// Рендер отфильтрованных услуг
function renderFilteredServices(filteredServices) {
    if (!window.renderServices) return;
    
    // Вызываем глобальную функцию рендера
    window.renderServices(filteredServices);
    
    // Отправляем событие о рендере для обновления маркеров
    window.dispatchEvent(new CustomEvent('servicesRendered', { 
        detail: filteredServices 
    }));
    
    // Показываем сообщение если ничего не найдено
    const servicesContainer = document.getElementById('services');
    const searchInput = document.getElementById('search');
    
    if (filteredServices.length === 0 && servicesContainer) {
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        const message = searchTerm ? 
            `По запросу "${searchTerm}" ничего не найдено 😔` : 
            'Услуги не найдены 😔';
        
        servicesContainer.innerHTML = `
            <div class="no-results glass">
                <p>${message}</p>
                <button class="btn btn-primary mt-4" onclick="resetFilters()">
                    <i class="fas fa-redo"></i>
                    Сбросить фильтры
                </button>
            </div>
        `;
    }
}

// Сброс фильтров (доступно глобально)
function resetFilters() {
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const priceSelect = document.getElementById('price');
    
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'Все услуги';
    if (priceSelect) priceSelect.value = 'Все цены';
    
    applyFilters();
}

// Делаем функцию сброса доступной глобально
window.resetFilters = resetFilters;

// Экспортируем функции
export { applyFilters, resetFilters };

