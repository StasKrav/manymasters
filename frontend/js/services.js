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

// Отрисовка карточек услуг
function renderServices(servicesList = services) {
  const container = document.getElementById('services');
  
  if (!container) return;
  
  if (servicesList.length === 0) {
    container.innerHTML = `
      <div class="no-results glass">
        <p>Ничего не найдено 😔</p>
      </div>
    `;
    return;
  }
  
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

// Инициализация услуг
export function initServices() {
  console.log('Services module initialized');
  renderServices();
  
  // Экспортируем функцию для других модулей
  window.renderServices = renderServices;
}