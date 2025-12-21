// Данные услуг (генерируются из мастеров)
export const services = [
  {
    "id": "master_1766322085343",
    "name": "м",
    "category": "Другое",
    "price": 1000,
    "master": "Станислав",
    "rating": 4.607026146065824,
    "time": "30 мин",
    "lat": 58.01678693255516,
    "lng": 56.25625547229962,
    "premium": false,
    "avatar": "👨‍🔧"
  },
  {
    "id": "master_1766322172328",
    "name": "э",
    "category": "Электрика",
    "price": 1000,
    "master": "Кравченко",
    "rating": 4.7516639598484325,
    "time": "30 мин",
    "lat": 58.01419242163477,
    "lng": 56.25766950134654,
    "premium": false,
    "avatar": "👨‍🔧"
  },
  {
    "id": "master_1766322683629",
    "name": "с",
    "category": "Сантехника",
    "price": 1000,
    "master": "Стас",
    "rating": 4.662802406475472,
    "time": "30 мин",
    "lat": 58.00947226570286,
    "lng": 56.24767443316674,
    "premium": false,
    "avatar": "👨‍🔧"
  }
];

// Отрисовка карточек услуг
function renderServices(servicesList = services) {
  console.log('🎨 Рендерим услуги, количество:', servicesList.length);
  
  const container = document.getElementById('services');
  
  if (!container) {
    console.error('❌ Не найден контейнер для услуг!');
    return;
  }
  
  if (servicesList.length === 0) {
    console.warn('⚠️ Нет услуг для отображения');
    container.innerHTML = `
      <div class="no-results glass">
        <p>Пока нет активных мастеров 😔</p>
        <p class="mt-2" style="font-size: 0.9em; opacity: 0.8;">
          Будьте первым — <a href="#" onclick="openRegistrationModal(); return false;" style="color: #60a5fa;">зарегистрируйтесь как мастер</a>
        </p>
      </div>
    `;
    return;
  }
  
  console.log('🖼️ Генерируем HTML для', servicesList.length, 'карточек...');
  
 
 
  container.innerHTML = servicesList.map(service => `
    <div class="service-card glass" data-id="${service.id}">
      <div class="service-card__content">
        <div class="service-card__avatar">
          ${service.avatar}
        </div>
        <div class="service-card__info">
          <h3 class="service-card__title">${service.name}</h3>
          <p class="service-card__master">${service.master}</p>
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
  `).join('');
  
  // Добавляем обработчики кликов на карточки
  container.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const serviceId = card.getAttribute('data-id');
      const service = servicesList.find(s => s.id === serviceId);
      if (service) {
        window.dispatchEvent(new CustomEvent('serviceSelected', { 
          detail: service 
        }));
      }
    });
  });
}

async function loadServicesFromServer() {
  try {
    const response = await fetch('http://localhost:3001/api/masters');
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    
    const masters = await response.json();
    
    // ОТЛАДКА
    console.log('🔄 Загружено мастеров:', masters.length);
    console.table(masters.map(m => ({
      id: m.id,
      name: m.name,
      status: m.status,
      hasCategories: !!(m.categories && m.categories.length),
      hasServices: !!(m.services && m.services.trim()),
      hasPrice: !!m.price
    })));
    
    const activeMasters = masters.filter(m => m.status === 'active');
    console.log('✅ Активных мастеров:', activeMasters.length);
    
    // Конвертируем мастеров в услуги
    const convertedServices = activeMasters.map((master, index) => {
      const serviceName = master.services 
        ? master.services.split(',')[0].trim() 
        : 'Услуги мастера';
      
      const category = master.categories && master.categories.length > 0
        ? master.categories[0]
        : 'Разное';
      
      console.log(`🎯 Конвертация ${index + 1}:`, {
        name: master.name,
        serviceName: serviceName,
        category: category,
        price: master.price || 1000
      });
      
      return {
        id: master.id || `master_${index + 1}`,
        name: serviceName,
        category: category,
        price: master.price || 1000,
        master: master.name || 'Мастер',
        rating: 4.5 + Math.random() * 0.5,
        time: '30 мин',
        lat: 58.0105 + (Math.random() - 0.5) * 0.02,
        lng: 56.2502 + (Math.random() - 0.5) * 0.02,
        premium: false,
        avatar: '👨‍🔧'
      };
    });
    
    console.log('📊 Сконвертировано услуг:', convertedServices.length);
    
    // Обновляем массив услуг
    services.length = 0;
    services.push(...convertedServices);
    
    // Рендерим
    renderServices();
    
  } catch (error) {
    console.warn('Не удалось загрузить данные с сервера:', error);
    if (services.length === 0) {
      services.push(...getTestData());
      renderServices();
      console.log('Используются тестовые данные');
    }
  }
}

// Инициализация услуг
export function initServices() {
  console.log('Services module initialized');
  renderServices();
  
  // Экспортируем функцию для других модулей
  window.renderServices = renderServices;
}
