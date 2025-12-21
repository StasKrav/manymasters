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
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!window.renderServices) return;
    
    if (searchTerm === '') {
        applyFilters();
        return;
    }
    
    const filtered = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm) ||
        service.master.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredServices(filtered);
}

// Применение фильтров
function applyFilters() {
    const categorySelect = document.getElementById('category');
    const priceSelect = document.getElementById('price');
    
    if (!categorySelect || !priceSelect || !window.renderServices) return;
    
    let filtered = [...services];
    
    // Фильтр по категории
    const selectedCategory = categorySelect.value;
    if (selectedCategory !== 'Все услуги') {
        // Убираем эмодзи для сравнения
        const category = selectedCategory.replace(/[🚿⚡🔨]/g, '').trim();
        filtered = filtered.filter(service => service.category === category);
    }
    
    // Фильтр по цене
    const selectedPrice = priceSelect.value;
    switch (selectedPrice) {
        case 'До 1000₽':
            filtered = filtered.filter(service => service.price <= 1000);
            break;
        case '1000-3000₽':
            filtered = filtered.filter(service => service.price > 1000 && service.price <= 3000);
            break;
        case '3000₽+':
            filtered = filtered.filter(service => service.price > 3000);
            break;
        // "Все цены" - ничего не фильтруем
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
