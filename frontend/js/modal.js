// Текущая выбранная услуга
let currentService = null;

// Инициализация модального окна
export function initModal() {
    console.log('Modal module initialized');
    
    const modal = document.getElementById('order-modal');
    const closeBtn = document.getElementById('close-modal');
    const submitBtn = document.getElementById('submit-order');
    
    if (!modal || !closeBtn || !submitBtn) return;
    
    // Слушаем событие выбора услуги
    window.addEventListener('serviceSelected', (event) => {
        currentService = event.detail;
        openModal(currentService);
    });
    
    // Закрытие модалки по кнопке
    closeBtn.addEventListener('click', () => closeModal());
    
    // Отправка формы
    submitBtn.addEventListener('click', submitOrder);
    
    // Закрытие по клику вне модалки
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

// Открытие модального окна
function openModal(service) {
    const modal = document.getElementById('order-modal');
    const serviceNameInput = document.getElementById('service-name');
    const masterNameInput = document.getElementById('master-name');
    
    if (!modal || !serviceNameInput || !masterNameInput) return;
    
    // Заполняем поля
    serviceNameInput.value = service.name;
    masterNameInput.value = `${service.master} • ${service.price}₽`;
    document.getElementById('description').value = '';
    
    // Показываем модалку
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Блокируем скролл
    
    // Импортируем и используем функцию скрытия карты
    import('./map.js').then(module => {
        if (module.hideMap) module.hideMap();
    }).catch(err => {
        console.error('Failed to hide map:', err);
    });
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById('order-modal');
    
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Восстанавливаем скролл
    
    // Очищаем текущую услугу
    currentService = null;
    
    // Импортируем и используем функцию показа карты
    import('./map.js').then(module => {
        if (module.showMap) module.showMap();
    }).catch(err => {
        console.error('Failed to show map:', err);
    });
}

// Отправка заказа
function submitOrder() {
    const serviceName = document.getElementById('service-name').value;
    const description = document.getElementById('description').value;
    
    if (!serviceName.trim()) {
        alert('Пожалуйста, укажите услугу');
        return;
    }
    
    if (!currentService) {
        alert('Ошибка: услуга не выбрана');
        return;
    }
    
    const commission = Math.floor(currentService.price * 0.15);
    const total = currentService.price + commission;
    
    // Показываем уведомление
    showNotification(serviceName, commission);
    
    // Логируем заказ
    console.log('📦 Новый заказ:', {
        service: serviceName,
        master: currentService.master,
        price: currentService.price,
        commission: commission,
        total: total,
        description: description,
        timestamp: new Date().toISOString()
    });
    
    // Закрываем модалку
    closeModal();
    
    // Можно добавить отправку на сервер здесь
    // sendOrderToServer({ serviceName, description, ... });
}

// Показ уведомления
function showNotification(serviceName, commission) {
    // Проверяем поддержку уведомлений
    if (!('Notification' in window)) {
        alert(`✅ Заказ на "${serviceName}" отправлен!\nКомиссия платформы: ${commission}₽`);
        return;
    }
    
    // Если разрешение уже есть
    if (Notification.permission === 'granted') {
        new Notification('✅ Заказ принят!', {
            body: `"${serviceName}"\nКомиссия: ${commission}₽`,
            icon: '/icon-192.png',
            badge: '/icon-192.png'
        });
    } 
    // Если разрешения нет, но можно запросить
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('✅ Заказ принят!', {
                    body: `"${serviceName}"\nКомиссия: ${commission}₽`,
                    icon: '/icon-192.png'
                });
            } else {
                // Показываем alert если уведомления запрещены
                alert(`✅ Заказ на "${serviceName}" отправлен!\nКомиссия платформы: ${commission}₽`);
            }
        });
    } 
    // Если уведомления запрещены
    else {
        alert(`✅ Заказ на "${serviceName}" отправлен!\nКомиссия платформы: ${commission}₽`);
    }
}
