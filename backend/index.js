const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'OtdelKadrovApp/1.0 (contact@example.com)'; // Важно для Nominatim

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// ===== КОНФИГУРАЦИЯ =====
const CONFIG = {
    port: process.env.PORT || 3001,
    // Админка: имя файла и данные для входа
    admin: {
        file: '6039f717.html',
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'finderprofi2024'
    },
    // Режим отладки (убирает console.log в проде)
    debug: process.env.DEBUG === 'true' || !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
};

// Логгер, который ничего не пишет в проде
const log = {
    info: (...args) => { if (CONFIG.debug) console.log(...args); },
    warn: (...args) => { if (CONFIG.debug) console.warn(...args); },
    error: (...args) => console.error(...args) // ошибки пишем всегда
};

// Middleware
app.use(cors());
app.use(express.json());

// ===== Basic Auth для админки =====
app.use('/' + CONFIG.admin.file, (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
        return res.status(401).send('Требуется авторизация');
    }

    const base64 = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(base64, 'base64').toString().split(':');

    if (username === CONFIG.admin.username && password === CONFIG.admin.password) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    res.status(401).send('Неверный логин или пароль');
});

// Раздаём статику (фронтенд)
app.use(express.static(path.join(__dirname, '../frontend')));

// Пути к файлам данных
const DATA_DIR = path.join(__dirname);
const MASTERS_FILE = path.join(DATA_DIR, 'masters.json');
const INVITES_FILE = path.join(DATA_DIR, 'invites.json');
const SERVICES_DATA_FILE = path.join(DATA_DIR, '../frontend/js/services-data.js');

// Инициализация файлов данных
async function initDataFiles() {
  try {
    // Создаем masters.json если его нет
    try {
      await fs.access(MASTERS_FILE);
    } catch {
      await fs.writeFile(MASTERS_FILE, JSON.stringify([], null, 2));
      log.info('Создан файл masters.json');
    }
    
    // Создаем invites.json если его нет
    try {
      await fs.access(INVITES_FILE);
    } catch {
      const defaultInvites = [
        {
          code: 'DEMO-INVITE-001',
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          expiresAt: null,
          maxUses: 1,
          usedCount: 0,
          usedBy: [],
          status: 'active'
        }
      ];
      await fs.writeFile(INVITES_FILE, JSON.stringify(defaultInvites, null, 2));
      log.info('Создан файл invites.json');
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
      log.info('Создан файл services-data.js');
    }
    
  } catch (error) {
    log.error('Ошибка инициализации данных:', error);
  }
}

async function geocodeAddress(address) {
    try {
        log.info(`🌍 Геокодируем адрес: ${address}`);
        
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
            log.info(`✅ Адрес найден: ${result.display_name}`);
            
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                displayName: result.display_name
            };
        } else {
            log.warn('❌ Адрес не найден:', address);
            return null;
        }
        
    } catch (error) {
        log.warn('⚠️ Ошибка геокодирования:', error.message);
        return null;
    }
}

// Чтение мастеров
async function readMasters() {
  try {
    const data = await fs.readFile(MASTERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log.error('Ошибка чтения masters.json:', error);
    return [];
  }
}

// Запись мастеров
async function writeMasters(masters) {
  try {
    await fs.writeFile(MASTERS_FILE, JSON.stringify(masters, null, 2));
  } catch (error) {
    log.error('Ошибка записи masters.json:', error);
  }
}



// ===== ИНВАЙТЫ =====

// Чтение инвайтов
async function readInvites() {
  try {
    const data = await fs.readFile(INVITES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log.error('Ошибка чтения invites.json:', error);
    return [];
  }
}

// Запись инвайтов
async function writeInvites(invites) {
  try {
    await fs.writeFile(INVITES_FILE, JSON.stringify(invites, null, 2));
  } catch (error) {
    log.error('Ошибка записи invites.json:', error);
  }
}

// Генерация случайного кода
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Проверка и использование инвайта
async function useInviteCode(code) {
  const invites = await readInvites();
  const invite = invites.find(i => i.code === code && i.status === 'active');
  
  if (!invite) {
    return { valid: false, error: 'Неверный инвайт-код' };
  }
  
  // Проверка срока действия
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    invite.status = 'expired';
    await writeInvites(invites);
    return { valid: false, error: 'Срок действия кода истёк' };
  }
  
  // Проверка лимита использований
  if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
    invite.status = 'used';
    await writeInvites(invites);
    return { valid: false, error: 'Инвайт-код уже использован' };
  }
  
  return { valid: true, invite };
}

// Отметить инвайт как использованный
async function markInviteUsed(code, masterId) {
  const invites = await readInvites();
  const invite = invites.find(i => i.code === code);
  
  if (!invite) return;
  
  invite.usedCount += 1;
  invite.usedBy.push({ masterId, usedAt: new Date().toISOString() });
  
  if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
    invite.status = 'used';
  }
  
  await writeInvites(invites);
}

// Сброс лимита инвайтов у мастеров (раз в неделю)
async function resetMasterInviteLimits() {
  const masters = await readMasters();
  const now = new Date();
  let changed = false;
  
  masters.forEach(master => {
    if (!master.inviteLimit) {
      master.inviteLimit = {
        weekly: 3,
        used: 0,
        weekStart: now.toISOString()
      };
      changed = true;
    } else {
      const weekStart = new Date(master.inviteLimit.weekStart);
      const daysSinceReset = (now - weekStart) / (1000 * 60 * 60 * 24);
      
      if (daysSinceReset >= 7) {
        master.inviteLimit.used = 0;
        master.inviteLimit.weekStart = now.toISOString();
        changed = true;
      }
    }
  });
  
  if (changed) {
    await writeMasters(masters);
  }
}

// API: Проверка инвайт-кода
app.post('/api/invites/verify', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, error: 'Введите инвайт-код' });
    }
    
    const result = await useInviteCode(code.trim().toUpperCase());
    
    if (result.valid) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false, error: result.error });
    }
    
  } catch (error) {
    log.error('Ошибка проверки инвайта:', error);
    res.status(500).json({ valid: false, error: 'Ошибка сервера' });
  }
});

// API: Создание инвайта (админ)
app.post('/api/invites/create', async (req, res) => {
  try {
    const { createdBy } = req.body;
    
    const newInvite = {
      code: generateInviteCode(),
      createdBy: createdBy || 'admin',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней
      maxUses: 1,
      usedCount: 0,
      usedBy: [],
      status: 'active'
    };
    
    const invites = await readInvites();
    invites.push(newInvite);
    await writeInvites(invites);
    
    log.info(`🔑 Создан инвайт: ${newInvite.code} (${createdBy})`);
    
    res.json({
      success: true,
      invite: newInvite
    });
    
  } catch (error) {
    log.error('Ошибка создания инвайта:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Создание инвайта от мастера
app.post('/api/invites/master-create', async (req, res) => {
  try {
    const { masterId } = req.body;
    
    if (!masterId) {
      return res.status(400).json({ success: false, error: 'ID мастера обязателен' });
    }
    
    // Сбрасываем лимиты если прошла неделя
    await resetMasterInviteLimits();
    
    const masters = await readMasters();
    const master = masters.find(m => m.id === masterId);
    
    if (!master) {
      return res.status(404).json({ success: false, error: 'Мастер не найден' });
    }
    
    // Инициализируем лимиты если нет
    if (!master.inviteLimit) {
      master.inviteLimit = {
        weekly: 3,
        used: 0,
        weekStart: new Date().toISOString()
      };
    }
    
    // Проверяем лимит
    if (master.inviteLimit.used >= master.inviteLimit.weekly) {
      return res.status(400).json({
        success: false,
        error: `Лимит инвайтов на эту неделю исчерпан (${master.inviteLimit.weekly}/${master.inviteLimit.weekly})`
      });
    }
    
    const newInvite = {
      code: generateInviteCode(),
      createdBy: masterId,
      createdByName: master.name,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: 1,
      usedCount: 0,
      usedBy: [],
      status: 'active'
    };
    
    const invites = await readInvites();
    invites.push(newInvite);
    await writeInvites(invites);
    
    // Увеличиваем счётчик использованных инвайтов у мастера
    master.inviteLimit.used += 1;
    await writeMasters(masters);
    
    log.info(`🔑 Мастер ${master.name} создал инвайт: ${newInvite.code}`);
    
    res.json({
      success: true,
      invite: newInvite,
      remaining: master.inviteLimit.weekly - master.inviteLimit.used
    });
    
  } catch (error) {
    log.error('Ошибка создания инвайта мастером:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Получение статистики по инвайтам (для админки)
app.get('/api/invites/stats', async (req, res) => {
  try {
    const invites = await readInvites();
    const masters = await readMasters();
    
    const totalInvites = invites.length;
    const usedInvites = invites.filter(i => i.usedCount > 0).length;
    const activeInvites = invites.filter(i => i.status === 'active').length;
    
    // Статистика по мастерам
    const masterStats = masters
      .filter(m => m.inviteLimit)
      .map(m => ({
        id: m.id,
        name: m.name,
        weekly: m.inviteLimit.weekly,
        used: m.inviteLimit.used,
        remaining: m.inviteLimit.weekly - m.inviteLimit.used
      }));
    
    res.json({
      totalInvites,
      usedInvites,
      activeInvites,
      masterStats
    });
    
  } catch (error) {
    log.error('Ошибка получения статистики инвайтов:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Список всех инвайтов (для админки)
app.get('/api/invites', async (req, res) => {
  try {
    const invites = await readInvites();
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function updateServicesData() {
    try {
        const masters = await readMasters();
        const activeMasters = masters.filter(m => m.status === 'active');
        
        const services = activeMasters.map((master) => {
            // Создаем объект услуги со ВСЕМИ нужными полями
            const service = {
                id: master.id,
                name: master.services ? master.services.split(',')[0].trim() : 'Услуги',
                category: master.mainCategory || 'Разное',
                price: master.price || 1000,
                master: master.name || 'Мастер',
                phone: master.phone || '', // ← ОБЯЗАТЕЛЬНО!
                rating: master.rating || 4.5 + Math.random() * 0.5,
                reviewsCount: Math.floor(Math.random() * 50) + 1,
                workType: master.workType || 'mobile',
                description: master.description || 'Опытный специалист. Работаю качественно и с гарантией.',
                createdAt: master.createdAt,
                updatedAt: master.updatedAt
            };
            
            // Добавляем адрес только если есть
            if (master.address) {
                service.address = master.address;
            }
            
            // Добавляем геоданные если есть
            if (master.geocoded) {
                service.geocoded = master.geocoded;
            }
            
            return service;
        });
        
        // Проверяем что телефоны есть
        log.info('📊 Проверка данных перед записью:');
        services.forEach((s, i) => {
            log.info(`  ${i+1}. ${s.master}: phone=${s.phone ? '✓' : '✗'}`);
        });
        
        // Форматируем для ES6 модуля
        const content = `// Автоматически сгенерировано из masters.json
// Не редактировать вручную!
export default ${JSON.stringify(services, null, 2)};`;
        
        await fs.writeFile(SERVICES_DATA_FILE, content);
        
        log.info(`✅ Файл обновлен: ${SERVICES_DATA_FILE}`);
        log.info(`📱 Телефоны добавлены: ${services.filter(s => s.phone).length}/${services.length}`);
        
        return services;
        
    } catch (error) {
        log.error('❌ Ошибка обновления:', error);
        throw error;
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
        
        log.info('📥 Получены данные регистрации:', masterData);
        
        // ПРОВЕРКА ИНВАЙТ-КОДА
        if (!masterData.inviteCode) {
            return res.status(400).json({
                error: 'Инвайт-код обязателен для регистрации'
            });
        }
        
        const inviteResult = await useInviteCode(masterData.inviteCode.trim().toUpperCase());
        if (!inviteResult.valid) {
            return res.status(400).json({
                error: inviteResult.error
            });
        }
        
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
            log.info(`📍 Адрес указан: ${masterData.address}`);
            
            // Случайные координаты в Перми (пока без реального геокодирования)
            geocodedResult = {
                lat: 58.01 + (Math.random() - 0.5) * 0.02,
                lng: 56.25 + (Math.random() - 0.5) * 0.02,
                displayName: masterData.address
            };
            
            log.info(`📍 Координаты: ${geocodedResult.lat}, ${geocodedResult.lng}`);
        }
        
        // Создаем нового мастера
        const newMaster = {
            id: 'master_' + Date.now(),
            name: masterData.name,
            phone: phone,
            mainCategory: masterData.mainCategory,
            services: masterData.services,
            description: masterData.description || '',
            price: parseInt(masterData.price) || 1000,
            workType: masterData.workType || 'mobile',
            address: masterData.address || '',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            rating: 4.5 + Math.random() * 0.5,
            registeredViaInvite: masterData.inviteCode.trim().toUpperCase()
        };
        
        log.info('👨‍🔧 Создан мастер:', newMaster.name);
        
        // Добавляем в базу
        masters.push(newMaster);
        await writeMasters(masters);
        
        // Отмечаем инвайт как использованный
        await markInviteUsed(masterData.inviteCode.trim().toUpperCase(), newMaster.id);
        
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
        log.error('❌ Ошибка регистрации:', error);
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
    
    log.info('🗑️ Мастер удален: ' + deletedMaster.name);
    
  } catch (error) {
    log.error('Ошибка удаления мастера:', error);
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
        log.info('📥 Запрос актуальных данных услуг');
        
        // Просто читаем из файла services-data.js
        const data = await fs.readFile(SERVICES_DATA_FILE, 'utf8');
        
        // Извлекаем массив из export default [...]
        const match = data.match(/export default (\[[\s\S]*\]);/);
        
        if (match && match[1]) {
            const services = JSON.parse(match[1]);
            log.info(`✅ Отправлено ${services.length} услуг`);
            res.json(services);
        } else {
            // Если не нашли - возвращаем пустой массив
            log.warn('⚠️ Не удалось распарсить services-data.js');
            res.json([]);
        }
        
    } catch (error) {
        log.error('❌ Ошибка получения данных:', error);
        
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
            
            log.info(`✅ Сгенерировано ${services.length} услуг из masters.json`);
            res.json(services);
            
        } catch (fallbackError) {
            log.error('❌ Ошибка fallback:', fallbackError);
            res.status(500).json({ error: 'Не удалось получить данные услуг' });
        }
    }
});

// index.js - добавим новый endpoint
app.post('/api/services/update', async (req, res) => {
    try {
        log.info('🔄 Запрос на обновление данных услуг');
        
        const updatedServices = await updateServicesData();
        
        res.json({
            success: true,
            message: `Данные обновлены. ${updatedServices.length} услуг`,
            services: updatedServices
        });
        
    } catch (error) {
        log.error('❌ Ошибка обновления:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Запуск сервера
async function startServer() {
  await initDataFiles();
  
  app.listen(CONFIG.port, () => {
    log.info('🚀 Сервер запущен на http://localhost:' + CONFIG.port);
    log.info('📞 API регистрации: POST http://localhost:' + CONFIG.port + '/api/masters/register');
  });
}

startServer();
