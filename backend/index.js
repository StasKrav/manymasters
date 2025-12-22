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
const SERVICES_DATA_FILE = path.join(DATA_DIR, '../frontend/js/services-data.js');

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
    
    // Создаем services-data.js если его нет
    try {
      await fs.access(SERVICES_DATA_FILE);
    } catch {
      const defaultData = `export default [
  {
    "id": "demo_master_1",
    "name": "Пример услуги",
    "category": "Демо",
    "price": 1000,
    "master": "Демо мастер",
    "rating": 4.5,
    "time": "30 мин",
    "lat": 58.0105,
    "lng": 56.2502,
    "premium": false,
    "avatar": "👨‍🔧"
  }
];`;
      await fs.writeFile(SERVICES_DATA_FILE, defaultData);
      console.log('Создан файл services-data.js');
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

// Обновление ТОЛЬКО данных услуг
async function updateServicesData() {
  try {
    const masters = await readMasters();
    const activeMasters = masters.filter(m => m.status === 'active');
    
    // Конвертируем мастеров в формат услуг
    const services = activeMasters.map((master, index) => ({
      id: master.id || 'master_' + Date.now() + '_' + index,
      name: master.services ? master.services.split(',')[0].trim() : 'Услуги мастера',
      category: master.categories ? master.categories[0] : 'Разное',
      price: master.price || 1000,
      master: master.name || 'Мастер',
      rating: 4.5 + Math.random() * 0.5,
      time: '30 мин',
      lat: 58.0105 + (Math.random() - 0.5) * 0.02,
      lng: 56.2502 + (Math.random() - 0.5) * 0.02,
      premium: false,
      avatar: '👨‍🔧'
    }));
    
    // Если нет активных мастеров, оставляем демо данные
    const servicesToSave = services.length > 0 ? services : [
      {
        "id": "demo_master_1",
        "name": "Нет активных мастеров",
        "category": "Зарегистрируйтесь первым!",
        "price": 0,
        "master": "Будьте первым",
        "rating": 5.0,
        "time": "Скоро",
        "lat": 58.0105,
        "lng": 56.2502,
        "premium": false,
        "avatar": "👨‍🔧"
      }
    ];
    
    // Записываем ТОЛЬКО данные
    const content = 'export default ' + JSON.stringify(servicesToSave, null, 2) + ';';
    await fs.writeFile(SERVICES_DATA_FILE, content);
    
    console.log('✅ Обновлен services-data.js с ' + services.length + ' активными мастерами');
    return services.length;
    
  } catch (error) {
    console.error('❌ Ошибка обновления services-data.js:', error);
    return 0;
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
      id: 'master_' + Date.now(),
      ...masterData,
      phone: phone,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        plan: 'free',
        status: 'active',
        expiresAt: null,
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
    
    // Обновляем ТОЛЬКО данные во фронтенде
    await updateServicesData();
    
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
    
    console.log('✅ Зарегистрирован новый мастер: ' + newMaster.name + ' (' + newMaster.phone + ')');
    
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
    await updateServicesData(); // Обновляем ТОЛЬКО данные
    
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
    await updateServicesData(); // Обновляем ТОЛЬКО данные
    
    res.json({
      success: true,
      message: 'Мастер деактивирован',
      master: masters[masterIndex]
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Удаление мастера
app.delete('/api/masters/:id', async (req, res) => {
  try {
    const masters = await readMasters();
    const masterIndex = masters.findIndex(m => m.id === req.params.id);
    
    if (masterIndex === -1) {
      return res.status(404).json({ error: 'Мастер не найден' });
    }
    
    const deletedMaster = masters[masterIndex];
    
    // Удаляем мастера
    masters.splice(masterIndex, 1);
    
    await writeMasters(masters);
    
    // Обновляем ТОЛЬКО данные во фронтенде
    await updateServicesData();
    
    res.json({
      success: true,
      message: 'Мастер удален',
      master: deletedMaster
    });
    
    console.log('🗑️ Мастер удален: ' + deletedMaster.name);
    
  } catch (error) {
    console.error('Ошибка удаления мастера:', error);
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
    const activeCount = masters.filter(m => m.status === 'active').length;
    
    res.json({
      totalMasters: masters.length,
      activeMasters: activeCount,
      pendingMasters: masters.filter(m => m.status === 'pending').length,
      ordersCount: masters.reduce((sum, m) => sum + (m.stats?.completedOrders || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
async function startServer() {
  await initDataFiles();
  
  app.listen(PORT, () => {
    console.log('🚀 Сервер запущен на http://localhost:' + PORT);
    console.log('📞 API регистрации: POST http://localhost:' + PORT + '/api/masters/register');
  });
}

startServer();
