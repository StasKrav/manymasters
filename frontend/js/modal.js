// modal.js - УПРОЩЕННАЯ ВЕРСИЯ ДЛЯ САЙТА (с копированием телефона)
export function initModal() {
    console.log('Modal module initialized');
    
    // Вешаем обработчик на body
    document.body.addEventListener('click', handleCardClick);
    
    console.log('✅ Обработчик клика установлен');
}

// Обработчик клика по карточке
function handleCardClick(event) {
    const card = event.target.closest('.service-card') || event.target.closest('.master-card');
    
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

// Создание модалки - УПРОЩЕННАЯ ДЛЯ САЙТА
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
            </div>
            
            <div class="modal__body">
                <div class="service-details">
                    <div class="detail-row">
                        <i class="fas fa-star"></i>
                        <span>Рейтинг: <strong id="modal-rating">4.5</strong> ⭐</span>
                    </div>
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
                
                <!-- КНОПКА ДЛЯ КОПИРОВАНИЯ ТЕЛЕФОНА -->
                <div class="contact-section">
                    <h4>Телефон мастера:</h4>
                    <div class="phone-button" id="phone-button">
                        <i class="fas fa-phone"></i>
                        <span id="phone-text">+7 912 345 67 89</span>
                    </div>
                    <p class="phone-hint" id="phone-hint">
                        <i class="fas fa-copy"></i>
                        Нажмите, чтобы скопировать номер
                    </p>
                </div>
                
                <div class="modal-actions">
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
}

// Закрытие модалки
function closeModal() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
}

// Обновление контента модалки
// modal.js - упрощаем, так как данные уже содержат телефоны
function updateModalContent(service) {
    console.log('📝 Заполняем модалку:', service);
    
    // Основная информация
    setElementText('modal-master-name', service.master || 'Мастер');
    setElementText('modal-service', service.name || service.category || 'Услуга');
    setElementText('modal-rating', service.rating?.toFixed(1) || '4.5');
    setElementText('modal-price', service.price || '1000');
    
    // Тип работы и адрес
    const workTypeEl = document.getElementById('modal-work-type');
    if (workTypeEl) {
        if (service.workType === 'stationary' && service.address) {
            workTypeEl.innerHTML = `<i class="fas fa-home"></i> ${service.address}`;
        } else {
            workTypeEl.innerHTML = '<i class="fas fa-car"></i> Выездной мастер';
        }
    }
    
    // Описание
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
        avatarEl.innerHTML = service.master.charAt(0).toUpperCase();
    }
    
    // Настраиваем кнопку телефона
    setupPhoneButton(service);
}

// Настройка кнопки телефона с копированием
function setupPhoneButton(service) {
    const phoneBtn = document.getElementById('phone-button');
    const phoneText = document.getElementById('phone-text');
    const phoneHint = document.getElementById('phone-hint');
    
    if (!phoneBtn || !phoneText) return;
    
    if (service.phone) {
        const formattedPhone = formatPhone(service.phone);
        phoneText.textContent = formattedPhone;
        
        // Делаем кнопку кликабельной для копирования
        phoneBtn.style.cursor = 'pointer';
        
        // Вешаем обработчик копирования
        phoneBtn.addEventListener('click', async function() {
            try {
                // Копируем чистый номер (без пробелов)
                const cleanPhone = service.phone.replace(/\D/g, '');
                await navigator.clipboard.writeText(cleanPhone);
                
                // Меняем текст кнопки на "Скопировано!"
                const originalText = phoneText.textContent;
                const originalHTML = phoneBtn.innerHTML;
                
                phoneBtn.innerHTML = '<i class="fas fa-check"></i> <span>Скопировано!</span>';
                phoneBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                if (phoneHint) {
                    phoneHint.innerHTML = `<i class="fas fa-check-circle"></i> Номер скопирован в буфер`;
                    phoneHint.style.color = '#10b981';
                }
                
                // Возвращаем через 2 секунды
                setTimeout(() => {
                    phoneBtn.innerHTML = originalHTML;
                    phoneText.textContent = originalText;
                    
                    if (phoneHint) {
                        phoneHint.innerHTML = `<i class="fas fa-copy"></i> Нажмите, чтобы скопировать номер`;
                        phoneHint.style.color = '';
                    }
                }, 2000);
                
                // Логируем копирование
                console.log('📋 Скопирован номер:', cleanPhone);
                
            } catch (err) {
                console.error('Ошибка копирования:', err);
                phoneText.textContent = 'Ошибка копирования';
                setTimeout(() => {
                    phoneText.textContent = formattedPhone;
                }, 1000);
            }
        });
        
    } else {
        // Нет телефона
        phoneText.textContent = 'Телефон не указан';
        phoneBtn.style.opacity = '0.6';
        phoneBtn.style.cursor = 'not-allowed';
        
        if (phoneHint) {
            phoneHint.innerHTML = `<i class="fas fa-exclamation-circle"></i> Мастер не указал телефон`;
            phoneHint.style.color = '#ef4444';
        }
    }
}

// Форматирование телефона
function formatPhone(phone) {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
        return `+7 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
    }
    
    if (cleaned.length === 10) {
        return `+7 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
    }
    
    return phone;
}

// Вспомогательная функция
function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Экспортируем для глобального использования
window.openModal = openModal;
window.closeModal = closeModal;
