const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'QuickFixApp/1.0 (contact@example.com)'; // Важно для Nominatim

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

async function geocodeAddress(address) {
    try {
        console.log(`🌍 Геокодируем адрес: ${address}`);
        
        const encodedAddress = encodeURIComponent(address + ', Пермь, Россия');
        const url = `${NOMINATIM_URL}?format=json&q=${encodedAddress}&limit=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'ru'
            }
        });
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            console.log(`✅ Адрес найден: ${result.display_name}`);
            
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                displayName: result.display_name
            };
        } else {
            console.warn('❌ Адрес не найден:', address);
            return null;
        }
        
    } catch (error) {
        console.warn('⚠️ Ошибка геокодирования:', error.message);
        return null;
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
// В backend/index.js обновляем updateServicesData:

async function updateServicesData() {
    try {
        const masters = await readMasters();
        const activeMasters = masters.filter(m => m.status === 'active');
        
        const services = activeMasters.map((master) => {
            // Базовые данные
            const service = {
                id: master.id,
                name: master.services ? master.services.split(',')[0].trim() : 'Услуги',
                category: master.mainCategory || 'Разное',
                price: master.price || 1000,
                master: master.name || 'Мастер',
                rating: master.stats?.rating || (4.5 + Math.random() * 0.5),
                time: '30 мин',
                premium: false,
                avatar: '👨‍🔧',
                workType: master.workType || 'mobile',
                description: master.description || '',
                hasLocation: false
            };
            
            // Координаты для стационарных мастеров
            if (master.workType === 'stationary' && master.geocoded) {
                service.lat = master.geocoded.lat;
                service.lng = master.geocoded.lng;
                service.hasLocation = true;
                service.address = master.address;
            } else {
                // Выездные мастера - случайные координаты
                service.lat = 58.01 + (Math.random() - 0.5) * 0.05;
                service.lng = 56.25 + (Math.random() - 0.5) * 0.05;
                service.hasLocation = false;
            }
            
            return service;
        });
        
        // Сохраняем в файл
        const content = 'export default ' + JSON.stringify(services, null, 2) + ';';
        await fs.writeFile(SERVICES_DATA_FILE, content);
        
        console.log(`✅ Обновлен services-data.js с ${services.length} мастерами`);
        
        return services;
        
    } catch (error) {
        console.error('❌ Ошибка обновления:', error);
        return [];
    }
}

// Вспомогательная функция для координат районов
function getDistrictCoordinates(district) {
    const coords = {
        'Центральный': { lat: 58.0132, lng: 56.2487 },
        'Дзержинский': { lat: 58.0054, lng: 56.2345 },
        'Индустриальный': { lat: 58.0201, lng: 56.2634 },
        'Кировский': { lat: 57.9956, lng: 56.2701 },
        'Ленинский': { lat: 58.0305, lng: 56.2204 },
        'Мотовилихинский': { lat: 58.0423, lng: 56.2456 },
        'Орджоникидзевский': { lat: 57.9823, lng: 56.1987 },
        'Свердловский': { lat: 58.0089, lng: 56.2856 },
        'all': { lat: 58.01, lng: 56.25 }
    };
    
    return coords[district] || coords['all'];
}

// API Routes

app.post('/api/masters/register', async (req, res) => {
    try {
        const masterData = req.body;
        
        console.log('📥 Получены данные регистрации:', masterData);
        
        // УПРОЩЕННАЯ ВАЛИДАЦИЯ
        if (!masterData.name || !masterData.phone) {
            return res.status(400).json({ 
                error: 'Имя и телефон обязательны' 
            });
        }
        
        // Если мастер стационарный - проверяем адрес
        if (masterData.workType === 'stationary' && !masterData.address) {
            return res.status(400).json({ 
                error: 'Для мастеров с мастерской укажите адрес'
            });
        }
        
        // Форматирование телефона
        const phone = masterData.phone.replace(/\D/g, '');
        
        // Читаем текущих мастеров
        const masters = await readMasters();
        
        // Проверяем дубликат телефона
        const existingMaster = masters.find(m => 
            m.phone.replace(/\D/g, '') === phone
        );
        
        if (existingMaster) {
            return res.status(400).json({ 
                error: 'Мастер с таким телефоном уже зарегистрирован'
            });
        }
        
        // ПРОСТОЕ ГЕОКОДИРОВАНИЕ (всегда успешно)
        let geocodedResult = null;
        if (masterData.address && masterData.workType === 'stationary') {
            console.log(`📍 Адрес указан: ${masterData.address}`);
            
            // Случайные координаты в Перми (пока без реального геокодирования)
            geocodedResult = {
                lat: 58.01 + (Math.random() - 0.5) * 0.02,
                lng: 56.25 + (Math.random() - 0.5) * 0.02,
                displayName: masterData.address
            };
            
            console.log(`📍 Координаты: ${geocodedResult.lat}, ${geocodedResult.lng}`);
        }
        
        // Создаем нового мастера
        const newMaster = {
            id: 'master_' + Date.now(),
            ...masterData,
            phone: phone,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Простые данные без сложных структур
            geocoded: geocodedResult,
            stats: {
                views: 0,
                calls: 0,
                rating: 4.5 + Math.random() * 0.5, // случайный рейтинг
                completedOrders: 0
            }
        };
        
        console.log('👨‍🔧 Создан мастер:', newMaster.name);
        
        // Добавляем в базу
        masters.push(newMaster);
        await writeMasters(masters);
        
        // Обновляем данные услуг
        await updateServicesData();
        
        // Возвращаем успех
        res.json({
            success: true,
            masterId: newMaster.id,
            message: 'Регистрация успешна!',
            data: {
                id: newMaster.id,
                name: newMaster.name,
                phone: newMaster.phone,
                address: newMaster.address || '',
                geocoded: !!newMaster.geocoded
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
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


// API: Получение актуальных данных для фронтенда
app.get('/api/services/latest', async (req, res) => {
    try {
        console.log('📥 Запрос актуальных данных услуг');
        
        // Просто читаем из файла services-data.js
        const data = await fs.readFile(SERVICES_DATA_FILE, 'utf8');
        
        // Извлекаем массив из export default [...]
        const match = data.match(/export default (\[[\s\S]*\]);/);
        
        if (match && match[1]) {
            const services = JSON.parse(match[1]);
            console.log(`✅ Отправлено ${services.length} услуг`);
            res.json(services);
        } else {
            // Если не нашли - возвращаем пустой массив
            console.warn('⚠️ Не удалось распарсить services-data.js');
            res.json([]);
        }
        
    } catch (error) {
        console.error('❌ Ошибка получения данных:', error);
        
        // В случае ошибки пробуем сгенерировать данные из masters.json
        try {
            const masters = await readMasters();
            const activeMasters = masters.filter(m => m.status === 'active');
            
            const services = activeMasters.map((master) => ({
                id: master.id,
                name: master.services ? master.services.split(',')[0].trim() : 'Услуги',
                category: master.mainCategory || 'Разное',
                price: master.price || 1000,
                master: master.name || 'Мастер',
                rating: master.rating || 4.5,
                time: '30 мин',
                premium: false,
                avatar: '👨‍🔧',
                workType: master.workType || 'mobile',
                description: master.description || '',
                hasLocation: master.hasLocation || false,
                lat: master.coordinates?.lat || 58.01 + (Math.random() - 0.5) * 0.05,
                lng: master.coordinates?.lng || 56.25 + (Math.random() - 0.5) * 0.05,
                address: master.address || ''
            }));
            
            console.log(`✅ Сгенерировано ${services.length} услуг из masters.json`);
            res.json(services);
            
        } catch (fallbackError) {
            console.error('❌ Ошибка fallback:', fallbackError);
            res.status(500).json({ error: 'Не удалось получить данные услуг' });
        }
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
