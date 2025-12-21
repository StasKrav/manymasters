// Данные услуг (генерируются из мастеров)
export const services = [
  {
    "id": "master_1766315226110",
    "name": "m",
    "category": "Другое",
    "price": 1000,
    "master": "Stas",
    "rating": 4.525625884447734,
    "time": "30 мин",
    "lat": 58.00862844591933,
    "lng": 56.24698090143825,
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