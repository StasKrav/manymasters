// Данные услуг (генерируются из мастеров)
export const services = [
  {
    "id": "master_1766322085343",
    "name": "м",
    "category": "Другое",
    "price": 1000,
    "master": "Станислав",
    "rating": 4.562111788028996,
    "time": "30 мин",
    "lat": 58.01662447617287,
    "lng": 56.24219327178454,
    "premium": false,
    "avatar": "👨‍🔧"
  },
  {
    "id": "master_1766322683629",
    "name": "с",
    "category": "Сантехника",
    "price": 1000,
    "master": "Стас",
    "rating": 4.50716720994036,
    "time": "30 мин",
    "lat": 58.00078800034456,
    "lng": 56.24971055878515,
    "premium": false,
    "avatar": "👨‍🔧"
  },
  {
    "id": "master_1766325332258",
    "name": "m",
    "category": "Другое",
    "price": 1500,
    "master": "stas",
    "rating": 4.744485558765979,
    "time": "30 мин",
    "lat": 58.00428125478482,
    "lng": 56.255777594136696,
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
              <!-- Кружок с инициалами -->
              <div class="master-avatar">
                  ${getInitials(service.master)}
              </div>
              
              <!-- Основная информация -->
              <div class="service-card__info">
                  <!-- Имя мастера -->
                  <h3 class="service-card__name">${service.master}</h3>
                  
                  <!-- Вид услуги -->
                  <p class="service-card__service">${service.category}</p>
                  
                  <!-- Рейтинг и отзывы -->
                  <div class="service-card__rating">
                      ${renderStars(service.rating)}
                      <span class="reviews-count">(${service.reviewsCount || 0})</span>
                  </div>
              </div>
              
              <!-- Цена справа -->
              <div class="service-card__price">
                  от ${service.price}₽
              </div>
          </div>
      </div>
  `).join('');

  async function loadServicesFromServer() {
    try {
      console.log('🔄 Начинаем загрузку мастеров...');
      
      const response = await fetch('http://localhost:3001/api/masters');
      console.log('📡 Ответ сервера:', response.status, response.ok);
      
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      
      const masters = await response.json();
      console.log('📊 Получено мастеров с сервера:', masters.length);
      console.log('Данные мастеров:', JSON.stringify(masters, null, 2));
      
      // Показываем статусы всех мастеров
      console.log('📋 Статусы мастеров:');
      masters.forEach((master, i) => {
        console.log(`  ${i + 1}. ${master.name || 'Без имени'} - статус: "${master.status || 'нет статуса'}"`);
      });
      
      // Фильтруем только активных
      const activeMasters = masters.filter(m => m.status === 'active');
      console.log(`✅ Активных мастеров: ${activeMasters.length} из ${masters.length}`);
      
      // Если нет активных, покажем всех для отладки
      if (activeMasters.length === 0) {
        console.warn('⚠️ Нет активных мастеров! Показываем всех для отладки...');
        activeMasters = [...masters]; // показываем всех
      }
      
      // Конвертируем мастеров в услуги
      // В функции loadServicesFromServer обновляем конвертацию:
      const convertedServices = activeMasters.map((master, index) => {
          // Получаем первую услугу полностью
          const firstService = master.services 
              ? master.services.split(',')[0].trim()
              : 'Услуги';
          
          // Форматируем для отображения (первые 2-3 слова)
          const displayService = firstService
              .split(' ')
              .slice(0, 3)
              .join(' ');
          
          return {
              id: master.id || `master_${index + 1}`,
              master: master.name || 'Мастер',
              category: displayService, // Используем как вид услуги
              price: master.price || 0, // Реальная цена мастера
              rating: master.stats?.rating || 0, // Реальный рейтинг когда будет
              reviewsCount: master.stats?.totalReviews || 0, // Количество отзывов
              // Остальные поля пока не используем
              time: '30 мин',
              lat: 58.0105 + (Math.random() - 0.5) * 0.02,
              lng: 56.2502 + (Math.random() - 0.5) * 0.02,
              premium: false
          };
      });
      
      console.log(`📦 Сконвертировано услуг: ${convertedServices.length}`);
      
      // Обновляем массив услуг
      services.length = 0;
      services.push(...convertedServices);
      
      // Рендерим
      console.log('🎨 Начинаем рендеринг...');
      renderServices();
      
      console.log('✅ Загрузка завершена успешно!');
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      
      // Используем тестовые данные если сервер недоступен
      if (services.length === 0) {
        console.log('🔄 Используем тестовые данные...');
        services.push(...getTestData());
        renderServices();
      }
    }
  }

  // Функция для получения инициалов
  function getInitials(fullName) {
      if (!fullName) return 'М';
      const names = fullName.split(' ');
      if (names.length >= 2) {
          return (names[0][0] + names[1][0]).toUpperCase();
      }
      return fullName[0].toUpperCase();
  }
  
  // Функция для отрисовки звезд
  function renderStars(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      let stars = '';
      
      for (let i = 0; i < 5; i++) {
          if (i < fullStars) {
              stars += '<i class="fas fa-star"></i>';
          } else if (i === fullStars && hasHalfStar) {
              stars += '<i class="fas fa-star-half-alt"></i>';
          } else {
              stars += '<i class="far fa-star"></i>';
          }
      }
      return stars;
  }
  
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
