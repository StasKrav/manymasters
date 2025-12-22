// modal.js - УЛУЧШЕННАЯ ВЕРСИЯ
export function initModal() {
    console.log('Modal module initialized');
    
    // Вешаем обработчик на body
    document.body.addEventListener('click', handleCardClick);
    
    console.log('✅ Обработчик клика установлен');
}

// Обработчик клика по карточке
function handleCardClick(event) {
    // Ищем ближайшую карточку
    const card = event.target.closest('.service-card');
    
    if (card) {
        const serviceId = card.getAttribute('data-id');
        const service = window.services?.find(s => s.id === serviceId);
        
        if (service) {
            console.log('🖱️ Клик по карточке:', service.master);
            event.preventDefault();
            event.stopPropagation();
            openModal(service);
        }
    }
}

// Открытие модалки
function openModal(service) {
    // Убеждаемся что модалка создана
    ensureModalExists();
    
    const modal = document.getElementById('service-modal');
    
    if (!modal) {
        console.error('❌ Модальное окно не найдено!');
        return;
    }
    
    // Заполняем данными
    updateModalContent(service);
    
    // Показываем
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
    
    console.log('📱 Модалка открыта для:', service.master);
}

// Убедиться что модалка существует
function ensureModalExists() {
    if (!document.getElementById('service-modal')) {
        console.log('🛠️ Создаем модальное окно...');
        createModal();
    }
}

// Создание модалки - УПРОЩЕННАЯ ВЕРСИЯ
function createModal() {
    const modalHTML = `
    <div id="service-modal" class="modal" style="display: none;">
        <div class="modal__content">
            <div class="modal__header">
                <div class="modal__icon" id="modal-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="modal__header-info">
                    <h3 class="modal__title" id="modal-master-name">Мастер</h3>
                    <p class="modal__subtitle" id="modal-service">Услуга</p>
                </div>
                <!-- УБРАЛИ КНОПКУ С КРЕСТИКОМ СЛЕВА -->
            </div>
            
            <div class="modal__body">
                <div class="service-details">
                    <div class="detail-row">
                        <i class="fas fa-star"></i>
                        <span>Рейтинг: <strong id="modal-rating">4.5</strong> ⭐</span>
                    </div>
                    <!-- УБРАЛИ СТРОКУ "30 МИН" -->
                    <div class="detail-row">
                        <i class="fas fa-tag"></i>
                        <span>Цена: <strong id="modal-price">1000</strong> ₽</span>
                    </div>
                    <div class="detail-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <span id="modal-work-type">Выездной мастер</span>
                    </div>
                </div>
                
                <div class="service-description">
                    <h4>Описание:</h4>
                    <p id="modal-description">Нет описания</p>
                </div>
                
                <!-- ДОБАВИЛИ ПОЛЕ ДЛЯ СООБЩЕНИЯ -->
                <div class="message-section">
                    <h4>Ваше сообщение мастеру (необязательно):</h4>
                    <textarea 
                        id="client-message" 
                        class="message-input"
                        placeholder="Например: Мне нужно починить кран на кухне, есть ли у вас нужные запчасти?"
                        rows="3"
                    ></textarea>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" id="call-master">
                        <i class="fas fa-phone"></i>
                        Позвонить мастеру
                    </button>
                    <button class="btn btn-secondary" id="send-message">
                        <i class="fas fa-paper-plane"></i>
                        Отправить сообщение
                    </button>
                    <button class="btn btn-close-modal" id="close-modal-btn">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Вешаем обработчики
    setupModalHandlers();
    
    console.log('✅ Модальное окно создано');
}

// Настройка обработчиков модалки
function setupModalHandlers() {
    const modal = document.getElementById('service-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const callBtn = document.getElementById('call-master');
    const sendMessageBtn = document.getElementById('send-message');
    
    // Закрытие по кнопке
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Закрытие по клику вне окна
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Кнопка звонка
    if (callBtn) {
        callBtn.addEventListener('click', handleCallClick);
    }
    
    // Кнопка отправки сообщения
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', handleSendMessage);
    }
}

// Обработка звонка
function handleCallClick() {
    const masterName = document.getElementById('modal-master-name')?.textContent;
    alert(`📞 Имитация звонка мастеру: ${masterName}\n\nВ реальном приложении здесь будет переход в телефон.`);
}

// Обработка отправки сообщения
function handleSendMessage() {
    const messageInput = document.getElementById('client-message');
    const masterName = document.getElementById('modal-master-name')?.textContent;
    const message = messageInput?.value.trim();
    
    if (!message) {
        alert('✏️ Напишите сообщение мастеру');
        messageInput?.focus();
        return;
    }
    
    if (message.length < 5) {
        alert('Сообщение слишком короткое');
        return;
    }
    
    // В реальном приложении здесь будет отправка на сервер
    console.log('💬 Сообщение мастеру:', {
        master: masterName,
        message: message,
        timestamp: new Date().toISOString()
    });
    
    alert(`✅ Сообщение отправлено мастеру "${masterName}"\n\n"${message}"`);
    
    // Очищаем поле и закрываем модалку
    if (messageInput) {
        messageInput.value = '';
    }
    
    closeModal();
}

// Закрытие модалки
function closeModal() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            // Очищаем поле сообщения при закрытии
            const messageInput = document.getElementById('client-message');
            if (messageInput) messageInput.value = '';
        }, 300);
        document.body.style.overflow = '';
    }
}

// Обновление контента модалки
function updateModalContent(service) {
    console.log('📝 Заполняем модалку данными:', service);
    
    // Основная информация
    setElementText('modal-master-name', service.master || 'Мастер');
    setElementText('modal-service', service.name || service.category || 'Услуга');
    setElementText('modal-rating', service.rating?.toFixed(1) || '4.5');
    setElementText('modal-price', service.price || '1000');
    
    // Тип работы
    const workTypeEl = document.getElementById('modal-work-type');
    if (workTypeEl) {
        workTypeEl.innerHTML = service.workType === 'stationary' 
            ? '<i class="fas fa-home"></i> Принимает у себя' 
            : '<i class="fas fa-car"></i> Выездной мастер';
    }
    
    // Описание мастера
    const descEl = document.getElementById('modal-description');
    if (descEl) {
        descEl.textContent = service.description || 'Мастер не добавил описание';
    }
    
    // Аватар
    const avatarEl = document.getElementById('modal-avatar');
    if (avatarEl && service.master) {
        const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
        const color = colors[service.master.length % colors.length];
        avatarEl.style.background = `linear-gradient(135deg, ${color}, ${color}99)`;
        
        // Инициал
        const initial = service.master.charAt(0).toUpperCase();
        avatarEl.innerHTML = initial.match(/[А-ЯA-Z]/) ? initial : 'M';
    }
    
    // Сохраняем ID сервиса для кнопок
    const callBtn = document.getElementById('call-master');
    const sendBtn = document.getElementById('send-message');
    
    if (callBtn) callBtn.setAttribute('data-service-id', service.id);
    if (sendBtn) sendBtn.setAttribute('data-service-id', service.id);
}

// Вспомогательная функция
function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Экспортируем для глобального использования
window.openModal = openModal;
window.closeModal = closeModal;
