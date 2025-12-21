// Регистрация мастеров
export function initMasterRegistration() {
    console.log('Master Registration module initialized');
    
    // Кнопка "Стать мастером" в хедере
    const becomeMasterBtn = document.createElement('button');
    becomeMasterBtn.id = 'become-master-btn';
    becomeMasterBtn.className = 'btn btn-secondary';
    becomeMasterBtn.innerHTML = '<i class="fas fa-tools"></i> Стать мастером';
    
    // Добавляем кнопку в хедер
    const headerTop = document.querySelector('.header__top');
    if (headerTop) {
        headerTop.appendChild(becomeMasterBtn);
    }
    
    // Создаем модальное окно регистрации
    createRegistrationModal();
    
    // Обработчик клика по кнопке
    becomeMasterBtn.addEventListener('click', openRegistrationModal);
}

// Создание модального окна регистрации
function createRegistrationModal() {
    const modalHTML = `
    <div id="master-registration-modal" class="modal">
        <div class="modal__content" style="max-width: 500px;">
            <div class="modal__header">
                <div class="modal__icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
                    <i class="fas fa-user-plus"></i>
                </div>
                <div>
                    <h3 class="modal__title">Регистрация мастера</h3>
                    <p class="modal__subtitle">Бесплатно • Пермь</p>
                </div>
            </div>
            
            <form id="master-registration-form">
                <div class="form-group">
                    <label for="master-name">Имя и фамилия *</label>
                    <input type="text" id="master-name" name="name" required 
                           placeholder="Иван Петров" class="modal__input">
                </div>
                
                <div class="form-group">
                    <label for="master-phone">Телефон *</label>
                    <input type="tel" id="master-phone" name="phone" required 
                           placeholder="+7 912 345-67-89" class="modal__input">
                    <small class="form-hint">На этот номер вам будут звонить клиенты</small>
                </div>
                
                <div class="form-group">
                    <label for="master-categories">Категории услуг *</label>
                    <div class="categories-grid">
                        <label class="category-checkbox">
                            <input type="checkbox" name="categories" value="Сантехника">
                            <span>🚿 Сантехника</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="categories" value="Электрика">
                            <span>⚡ Электрика</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="categories" value="Ремонт">
                            <span>🔨 Ремонт</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="categories" value="Уборка">
                            <span>🧹 Уборка</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="categories" value="Переезды">
                            <span>🚚 Переезды</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="categories" value="Другое">
                            <span>✨ Другое</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="master-services">Какие услуги предоставляете? *</label>
                    <textarea id="master-services" name="services" required 
                              placeholder="Замена кранов, установка смесителей, прочистка засоров..."
                              class="modal__textarea" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="master-description">Кратко о себе</label>
                    <textarea id="master-description" name="description" 
                              placeholder="Опыт работы 5 лет, работаю аккуратно, гарантия на работу..."
                              class="modal__textarea" rows="2"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="master-price">Минимальная цена выезда (₽) *</label>
                    <input type="number" id="master-price" name="price" 
                           required min="0" max="50000" step="100"
                           placeholder="1500" class="modal__input">
                    <small class="form-hint">Эта цена будет отображаться в карточке как "от ХХХ₽"</small>
                </div>
                
                <div class="form-notice">
                    <i class="fas fa-info-circle"></i>
                    <span>Регистрация бесплатна. Профиль появится в каталоге сразу после отправки формы.</span>
                </div>
                
                <div class="modal__actions">
                    <button type="submit" class="btn btn-primary" id="submit-registration">
                        <i class="fas fa-check"></i>
                        Зарегистрироваться
                    </button>
                    <button type="button" class="btn btn-close" id="close-registration-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
    
    // Добавляем модалку в body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Добавляем стили
    addRegistrationStyles();
    
    // Вешаем обработчики
    const form = document.getElementById('master-registration-form');
    const closeBtn = document.getElementById('close-registration-modal');
    const modal = document.getElementById('master-registration-modal');
    
    if (form) {
        form.addEventListener('submit', handleRegistrationSubmit);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeRegistrationModal());
    }

    
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeRegistrationModal();
            }
        });
    }
}

// Открытие модалки регистрации
function openRegistrationModal() {
    const modal = document.getElementById('master-registration-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Закрытие модалки регистрации
function closeRegistrationModal() {
    const modal = document.getElementById('master-registration-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        // Очищаем форму
        const form = document.getElementById('master-registration-form');
        if (form) form.reset();
    }
}

// Обработка отправки формы
async function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submit-registration');
    const originalText = submitBtn.innerHTML;
    
    // Показываем загрузку
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;
    
    try {
        // Собираем данные формы
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            categories: formData.getAll('categories'),
            services: formData.get('services'),
            description: formData.get('description') || '',
            price: parseInt(formData.get('price')) || 0
        };
        
        // Валидация
        if (!data.name || !data.phone || !data.categories.length || !data.services) {
            throw new Error('Заполните обязательные поля');
        }
        
        // Отправляем на сервер
        const response = await fetch('http://localhost:3001/api/masters/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Ошибка регистрации');
        }
        
        // Успешная регистрация
        showRegistrationSuccess(result);
        
        // Закрываем модалку через 3 секунды
        setTimeout(() => {
            closeRegistrationModal();
            // Перезагружаем список услуг
            if (window.renderServices) {
                // Нужно будет перезагрузить страницу или обновить данные
                window.location.reload();
            }
        }, 3000);
        
    } catch (error) {
        // Показываем ошибку
        showRegistrationError(error.message);
        
        // Возвращаем кнопку в исходное состояние
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Показ успешной регистрации
function showRegistrationSuccess(result) {
    const modalContent = document.querySelector('#master-registration-modal .modal__content');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="registration-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Регистрация успешна! 🎉</h3>
            <p>Ваш профиль активен и уже отображается в каталоге.</p>
            <div class="success-details">
                <p><strong>ID профиля:</strong> ${result.masterId}</p>
                <p><strong>Имя:</strong> ${result.data.name}</p>
                <p><strong>Телефон:</strong> ${result.data.phone}</p>
            </div>
            <div class="success-notice">
                <i class="fas fa-info-circle"></i>
                <p>На ваш номер могут начать звонить клиенты в любое время.</p>
            </div>
            <button onclick="closeRegistrationModal()" class="btn btn-primary">
                <i class="fas fa-thumbs-up"></i>
                Отлично!
            </button>
        </div>
    `;
}

// Показ ошибки регистрации
function showRegistrationError(message) {
    // Показываем сообщение об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="background: #dc3545; color: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Ошибка:</strong> ${message}
        </div>
    `;
    
    // Вставляем перед формой
    const form = document.getElementById('master-registration-form');
    if (form && form.parentNode) {
        // Удаляем старую ошибку если есть
        const oldError = form.parentNode.querySelector('.error-message');
        if (oldError) oldError.remove();
        
        form.parentNode.insertBefore(errorDiv, form);
    }
}

// Добавление стилей для формы регистрации
function addRegistrationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .categories-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
            margin: 0.5rem 0;
        }
        
        .category-checkbox {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .category-checkbox:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .category-checkbox input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .category-checkbox span {
            font-size: 0.95rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-secondary);
        }
        
        .form-hint {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        .form-notice {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1.5rem 0;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        
        .form-notice i {
            color: #3b82f6;
            margin-top: 0.25rem;
        }
        
        .form-notice span {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        
        .registration-success {
            text-align: center;
            padding: 1rem;
        }
        
        .success-icon {
            font-size: 4rem;
            color: #10b981;
            margin: 1rem 0;
        }
        
        .success-details {
            background: rgba(16, 185, 129, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: left;
        }
        
        .success-details p {
            margin: 0.5rem 0;
        }
        
        .success-notice {
            background: rgba(59, 130, 246, 0.1);
            border-radius: 8px;
            padding: 1rem;
            margin: 1.5rem 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .success-notice i {
            color: #3b82f6;
        }
        
        @media (max-width: 640px) {
            .categories-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Делаем функции доступными глобально
window.openRegistrationModal = openRegistrationModal;
window.closeRegistrationModal = closeRegistrationModal;
