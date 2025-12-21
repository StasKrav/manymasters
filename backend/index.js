const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Пути к файлам данных
const DATA_DIR = path.join(__dirname);
const MASTERS_FILE = path.join(DATA_DIR, 'masters.json');
const SERVICES_FILE = path.join(DATA_DIR, '../frontend/js/services.js');

// Инициализация файлов данных
async function initDataFiles() {
  try {
    // Создаем masters.json если его нет
    try {
      await fs.access(MASTERS_FILE);
    } catch {
      await fs.writeFile(MASTERS_FILE, JSON.stringify([], null, 2));
      console.log('Создан файл masters.json');
    }
  } catch (error) {
    console.error('Ошибка инициализации данных:', error);
  }
}

// Чтение мастеров
async function readMasters() {
  try {
    const data = await fs.readFile(MASTERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения masters.json:', error);
    return [];
  }
}

// Запись мастеров
async function writeMasters(masters) {
  try {
    await fs.writeFile(MASTERS_FILE, JSON.stringify(masters, null, 2));
  } catch (error) {
    console.error('Ошибка записи masters.json:', error);
  }
}

// Обновление services.js с активными мастерами
async function updateServicesJS() {
  try {
    const masters = await readMasters();
    const activeMasters = masters.filter(m => m.status === 'active');
    
    // Конвертируем мастеров в формат услуг
    const services = activeMasters.map((master, index) => ({
      id: master.id || `master_${index + 1}`,
      name: master.services?.[0] || 'Услуги мастера',
      category: master.categories?.[0] || 'Разное',
      price: master.price || 1000,
      master: master.name || 'Мастер',
      rating: 4.5 + Math.random() * 0.5, // Рандомный рейтинг 4.5-5.0
      time: '30 мин',
      lat: 58.0105 + (Math.random() - 0.5) * 0.02,
      lng: 56.2502 + (Math.random() - 0.5) * 0.02,
      premium: false,
      avatar: master.avatar || '👨‍🔧'
    }));
    
    // Читаем текущий services.js
    let servicesContent = await fs.readFile(SERVICES_FILE, 'utf8');
    
    // Заменяем массив услуг (упрощенная замена)
    // В реальности нужно парсить JS, но для простоты:
    const newContent = `// Данные услуг (генерируются из мастеров)
export const services = ${JSON.stringify(services, null, 2)};

// Отрисовка карточек услуг
function renderServices(servicesList = services) {
  const container = document.getElementById('services');
  
  if (!container) return;
  
  if (servicesList.length === 0) {
    container.innerHTML = \`
      <div class="no-results glass">
        <p>Ничего не найдено 😔</p>
      </div>
    \`;
    return;
  }
  
  container.innerHTML = servicesList.map(service => \`
    <div class="service-card glass" data-id="\${service.id}">
      <div class="service-card__content">
        <div class="service-card__avatar">
          \${service.avatar}
        </div>
        <div class="service-card__info">
          <h3 class="service-card__title">\${service.name}</h3>
          <p class="service-card__master">\${service.master}</p>
          <div class="service-card__meta">
            <span class="service-card__rating">\${service.rating.toFixed(1)} ⭐</span>
            <span class="service-card__time">
              <i class="fas fa-clock"></i>
              \${service.time}
            </span>
          </div>
        </div>
        <div class="service-card__price">
          <div class="service-card__price-value">\${service.price}₽</div>
          \${service.premium ? '<div class="service-card__badge">PREMIUM</div>' : ''}
        </div>
      </div>
    </div>
  \`).join('');
  
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
}`;

    await fs.writeFile(SERVICES_FILE, newContent);
    console.log('Обновлен services.js с', activeMasters.length, 'мастерами');
    
  } catch (error) {
    console.error('Ошибка обновления services.js:', error);
  }
}

// API Routes

// Регистрация нового мастера
app.post('/api/masters/register', async (req, res) => {
  try {
    const masterData = req.body;
    
    // Валидация
    if (!masterData.name || !masterData.phone) {
      return res.status(400).json({ 
        error: 'Имя и телефон обязательны' 
      });
    }
    
    // Форматирование телефона
    const phone = masterData.phone.replace(/\D/g, '');
    if (phone.length < 10) {
      return res.status(400).json({ 
        error: 'Некорректный номер телефона' 
      });
    }
    
    // Читаем текущих мастеров
    const masters = await readMasters();
    
    // Проверяем, нет ли уже мастера с таким телефоном
    const existingMaster = masters.find(m => 
      m.phone.replace(/\D/g, '') === phone
    );
    
    if (existingMaster) {
      return res.status(400).json({ 
        error: 'Мастер с таким телефоном уже зарегистрирован',
        masterId: existingMaster.id
      });
    }
    
    // Создаем нового мастера
    const newMaster = {
      id: `master_${Date.now()}`,
      ...masterData,
      phone: phone,
      status: 'active', // Пока всех сразу активируем
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        plan: 'free',
        status: 'active',
        expiresAt: null, // Бессрочно (пока бесплатно)
        isTrial: true
      },
      stats: {
        views: 0,
        calls: 0,
        rating: 0,
        completedOrders: 0
      }
    };
    
    // Добавляем в базу
    masters.push(newMaster);
    await writeMasters(masters);
    
    // Обновляем фронтенд
    await updateServicesJS();
    
    // Возвращаем успех
    res.json({
      success: true,
      masterId: newMaster.id,
      message: 'Регистрация успешна! Ваш профиль уже активен.',
      data: {
        id: newMaster.id,
        name: newMaster.name,
        phone: newMaster.phone
      }
    });
    
    console.log(`✅ Зарегистрирован новый мастер: ${newMaster.name} (${newMaster.phone})`);
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message 
    });
  }
});

// API: Активация мастера
app.post('/api/masters/:id/activate', async (req, res) => {
  try {
    const masters = await readMasters();
    const masterIndex = masters.findIndex(m => m.id === req.params.id);
    
    if (masterIndex === -1) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    masters[masterIndex].status = 'active';
    masters[masterIndex].updatedAt = new Date().toISOString();
    
    await writeMasters(masters);
    await updateServicesJS();
    
    res.json({
      success: true,
      message: 'Мастер активирован',
      master: masters[masterIndex]
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Деактивация мастера
app.post('/api/masters/:id/deactivate', async (req, res) => {
  try {
    const masters = await readMasters();
    const masterIndex = masters.findIndex(m => m.id === req.params.id);
    
    if (masterIndex === -1) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    masters[masterIndex].status = 'inactive';
    masters[masterIndex].updatedAt = new Date().toISOString();
    
    await writeMasters(masters);
    await updateServicesJS();
    
    res.json({
      success: true,
      message: 'Мастер деактивирован',
      master: masters[masterIndex]
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение списка мастеров (для админки)
app.get('/api/masters', async (req, res) => {
  try {
    const masters = await readMasters();
    res.json(masters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение одного мастера
app.get('/api/masters/:id', async (req, res) => {
  try {
    const masters = await readMasters();
    const master = masters.find(m => m.id === req.params.id);
    
    if (!master) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    res.json(master);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Статистика
app.get('/api/stats', async (req, res) => {
  try {
    const masters = await readMasters();
    const activeMasters = masters.filter(m => m.status === 'active');
    
    res.json({
      totalMasters: masters.length,
      activeMasters: activeMasters.length,
      pendingMasters: masters.filter(m => m.status === 'pending').length,
      categories: [...new Set(masters.flatMap(m => m.categories || []))]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
async function startServer() {
  await initDataFiles();
  
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📞 API регистрации: POST http://localhost:${PORT}/api/masters/register`);
  });
}

startServer();
