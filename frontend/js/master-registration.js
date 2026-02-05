import { Validator, ValidationRules } from './validation.js'


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
        <div class="modal__content" style="max-width: 600px;">
            <div class="modal__header">
                <div class="modal__icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
                    <i class="fas fa-user-plus"></i>
                </div>
                <div>
                    <h3 class="modal__title">Регистрация мастера</h3>
                    <p class="modal__subtitle">Бесплатно • 3 минуты • Для любых специалистов</p>
                </div>
            </div>
            
            <form id="master-registration-form">
                <!-- 1. ОСНОВНАЯ ИНФОРМАЦИЯ -->
                <div class="form-section">
                    <h4 class="form-section-title">
                        <i class="fas fa-user"></i>
                        Основная информация
                    </h4>
                    
                    <div class="form-group">
                        <label for="master-name">Ваше имя или название компании *</label>
                        <input type="text" id="master-name" name="name" required 
                               placeholder="Иван Петров или 'Ремонт на дому'"
                               class="modal__input">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="master-phone">Телефон для связи *</label>
                            <input type="tel" id="master-phone" name="phone" required 
                                   placeholder="+7 912 345-67-89"
                                   class="modal__input">
                        </div>
                        
                        <div class="form-group">
                            <label for="master-price">Ваша цена (₽) *</label>
                            <input type="number" id="master-price" name="price" 
                                   required min="500" max="100000" step="100"
                                   placeholder="1500"
                                   class="modal__input">
                        </div>
                    </div>
                </div>
                
                <!-- 2. СПЕЦИАЛИЗАЦИЯ -->
                <div class="form-section">
                    <h4 class="form-section-title">
                        <i class="fas fa-tools"></i>
                        Что вы делаете?
                    </h4>
                    
                    <div class="form-group">
                        <label for="master-category">Основная категория *</label>
                        <select id="master-category" name="mainCategory" required class="modal__input">
                            <option value="">Выберите категорию</option>
                            <option value="Строительство и ремонт">🏗️ Строительство и ремонт</option>
                            <option value="Сантехника">🚿 Сантехника</option>
                            <option value="Электрика">⚡ Электрика</option>
                            <option value="Отделочные работы">🎨 Отделочные работы</option>
                            <option value="Мебель и сборка">🛠️ Мебель и сборка</option>
                            <option value="Ремонт техники">🔧 Ремонт техники</option>
                            <option value="Уборка и клининг">🧹 Уборка и клининг</option>
                            <option value="Грузоперевозки">🚚 Грузоперевозки</option>
                            <option value="Красота и здоровье">💇 Красота и здоровье</option>
                            <option value="Образование">📚 Образование</option>
                            <option value="Другое">✨ Другое</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="master-services">Конкретные услуги *</label>
                        <textarea id="master-services" name="services" required 
                                  placeholder="Например: установка смесителей, замена труб, прочистка засоров..."
                                  class="modal__textarea" rows="2"></textarea>
                        <small class="form-hint">Что именно вы делаете?</small>
                    </div>
                </div>
                
                <!-- 3. МЕСТО РАБОТЫ -->
                <div class="form-section">
                    <h4 class="form-section-title">
                        <i class="fas fa-map-marker-alt"></i>
                        Где работаете?
                    </h4>
                    
                    <div class="form-group">
                        <label for="work-type">Тип работы *</label>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="workType" value="mobile" checked>
                                <span>🚗 Выездной мастер</span>
                                <small>Работаю с выездом к клиенту</small>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="workType" value="stationary">
                                <span>🏠 Принимаю у себя</span>
                                <small>Есть помещение/мастерская</small>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group" id="address-block" style="display: none;">
                        <label for="master-address">Ваш точный адрес *</label>
                        <input type="text" id="master-address" name="address" 
                               placeholder="Например: ул. Ленина, 123, кв. 45"
                               class="modal__input">
                        <div class="form-hint">
                            <i class="fas fa-info-circle"></i>
                            Укажите для точного отображения на карте
                        </div>
                        <div class="address-examples">
                            <small>Правильный формат: </small>
                            <span class="example-badge" onclick="document.getElementById('master-address').value = 'ул. Ленина, 123'">ул. Ленина, 123</span>
                            <span class="example-badge" onclick="document.getElementById('master-address').value = 'проспект Парковый, 45'">пр. Парковый, 45</span>
                        </div>
                    </div>
                </div>
                
                <!-- 4. ОПИСАНИЕ (необязательно) -->
                <div class="form-section">
                    <h4 class="form-section-title">
                        <i class="fas fa-file-alt"></i>
                        Расскажите о себе (необязательно)
                    </h4>
                    
                    <div class="form-group">
                        <textarea id="master-description" name="description" 
                                  placeholder="Например: Опыт 5 лет, работаю аккуратно, даю гарантию..."
                                  class="modal__textarea" rows="2"></textarea>
                        <small class="form-hint">Почему клиентам стоит выбрать вас?</small>
                    </div>
                </div>
                
                <!-- 5. ЮРИДИЧЕСКИЕ СОГЛАСИЯ -->
                <div class="form-section">
                    <h4 class="form-section-title">
                        <i class="fas fa-balance-scale"></i>
                        Соглашения
                    </h4>
                    
                    <div class="legal-agreements">
                        <!-- Чекбокс пользовательского соглашения -->
                        <div class="form-group">
                            <label class="checkbox-option legal-checkbox">
                                <input type="checkbox" id="terms-agreement" name="termsAgreement" required>
                                <div class="checkbox-content">
                                    <span class="checkbox-label">
                                        Я принимаю <a href="/terms-of-service.html" target="_blank" class="legal-link">Пользовательское соглашение</a>
                                    </span>
                                    <small class="checkbox-description">
                                        (версия 1.0 от 15.01.2024)
                                    </small>
                                </div>
                            </label>
                        </div>
                        
                        <!-- Чекбокс политики конфиденциальности -->
                        <div class="form-group">
                            <label class="checkbox-option legal-checkbox">
                                <input type="checkbox" id="privacy-agreement" name="privacyAgreement" required>
                                <div class="checkbox-content">
                                    <span class="checkbox-label">
                                        Я принимаю <a href="/privacy-policy.html" target="_blank" class="legal-link">Политику конфиденциальности</a>
                                    </span>
                                    <small class="checkbox-description">
                                        (версия 1.0 от 15.01.2024)
                                    </small>
                                </div>
                            </label>
                        </div>
                        
                        <!-- Чекбокс согласия на обработку ПДн -->
                        <div class="form-group">
                            <label class="checkbox-option legal-checkbox">
                                <input type="checkbox" id="pd-agreement" name="pdAgreement" required>
                                <div class="checkbox-content">
                                    <span class="checkbox-label">
                                        Я даю согласие на обработку персональных данных
                                    </span>
                                    <small class="checkbox-description">
                                        <a href="/data-processing-agreement.html" target="_blank" class="legal-link">Подробнее о целях обработки</a>
                                    </small>
                                </div>
                            </label>
                        </div>
                        
                        <!-- Информационный блок -->
                        <div class="legal-info">
                            <h5>Что это значит?</h5>
                            <ul>
                                <li>✓ Мы обрабатываем только указанные вами данные</li>
                                <li>✓ Данные используются только для связи с клиентами</li>
                                <li>✓ Вы можете отозвать согласие в любой момент</li>
                                <li>✓ Мы не передаём данные третьим лицам без вашего согласия</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="form-notice success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Бесплатно и сразу</strong>
                        <p>Ваш профиль появится в каталоге сразу после отправки</p>
                    </div>
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
        
        // Логика показа/скрытия адреса
        const workTypeRadios = form.querySelectorAll('input[name="workType"]');
        const addressBlock = document.getElementById('address-block');
        
        workTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'stationary') {
                    addressBlock.style.display = 'block';
                    document.getElementById('master-address').required = true;
                } else {
                    addressBlock.style.display = 'none';
                    document.getElementById('master-address').required = false;
                }
            });
        });
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

    setupLiveValidation()
}

function setupLiveValidation() {
    const form = document.getElementById('master-registration-form');
    if (!form) return;
    
    // Следим за изменением типа работы
    const workTypeRadios = form.querySelectorAll('input[name="workType"]');
    const addressInput = form.querySelector('[name="address"]');
    const addressBlock = document.getElementById('address-block');
    
    workTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'stationary') {
                addressBlock.style.display = 'block';
                if (addressInput) {
                    addressInput.required = true;
                    addressInput.placeholder = 'Например: ул. Ленина, 123 *';
                }
            } else {
                addressBlock.style.display = 'none';
                if (addressInput) {
                    addressInput.required = false;
                    addressInput.placeholder = 'Для выездных мастеров не требуется';
                    addressInput.value = ''; // Очищаем при переключении
                }
            }
        });
    });
  
  // Счетчик слов для описания
  const descInput = form.querySelector('[name="description"]')
  if (descInput) {
    const charCounter = document.createElement('div')
    charCounter.className = 'char-counter'
    charCounter.style.fontSize = '0.8rem'
    charCounter.style.color = 'var(--text-muted)'
    charCounter.style.textAlign = 'right'
    charCounter.style.marginTop = '0.25rem'
    
    descInput.parentNode.appendChild(charCounter)
    
    descInput.addEventListener('input', function() {
      const words = this.value.trim().split(/\s+/).filter(w => w.length > 0)
      const chars = this.value.length
      
      charCounter.textContent = `${words.length}/100 слов, ${chars}/2000 символов`
      
      if (words.length > 100 || chars > 2000) {
        charCounter.classList.add('error')
        charCounter.classList.remove('warning')
      } else if (words.length > 80 || chars > 1800) {
        charCounter.classList.add('warning')
        charCounter.classList.remove('error')
      } else {
        charCounter.classList.remove('warning', 'error')
      }
    })
  }
  
  // Валидация при потере фокуса
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', function() {
      const fieldName = this.name
      const value = this.value
      
      if (ValidationRules[fieldName]) {
        const result = Validator.validate(fieldName, value)
        
        if (!result.valid) {
          showFieldError(this, result.message)
        } else {
          clearFieldError(this)
        }
      }
    })
  })
}

function showFieldError(input, message) {
  clearFieldError(input)
  
  const existingError = input.parentNode.querySelector('.validation-error')
  if (existingError) existingError.remove()
  
  const errorEl = document.createElement('div')
  errorEl.className = 'validation-error'
  errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`
  
  input.parentNode.insertBefore(errorEl, input.nextSibling)
  input.classList.add('error')
}

function clearFieldError(input) {
  const errorEl = input.parentNode.querySelector('.validation-error')
  if (errorEl) errorEl.remove()
  input.classList.remove('error')
}

// Открытие модалки регистрации
function openRegistrationModal() {
    const modal = document.getElementById('master-registration-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Сбрасываем форму
        const form = document.getElementById('master-registration-form');
        if (form) {
            form.reset();
            // Сбрасываем видимость адреса
            const addressBlock = document.getElementById('address-block');
            if (addressBlock) addressBlock.style.display = 'none';
        }
    }
}

// Закрытие модалки регистрации
function closeRegistrationModal() {
    const modal = document.getElementById('master-registration-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Обработка отправки формы С ГЕОКОДИРОВАНИЕМ
// master-registration.js - ПОЛНАЯ ФУНКЦИЯ handleRegistrationSubmit
async function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submit-registration');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const workType = formData.get('workType');
        const address = formData.get('address') || '';
        
        const rawData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            mainCategory: formData.get('mainCategory'),
            services: formData.get('services'),
            description: formData.get('description') || '',
            price: formData.get('price'),
            workType: workType,
            address: address,
            
            // Юридические согласия
            termsAgreement: formData.get('termsAgreement') === 'on',
            privacyAgreement: formData.get('privacyAgreement') === 'on',
            pdAgreement: formData.get('pdAgreement') === 'on'
        };
        
        console.log('📋 Данные с согласиями:', rawData);
        
        // ВАЛИДАЦИЯ С УЧЕТОМ ТИПА РАБОТЫ
        const validation = Validator.validateForm(rawData);
        
        if (!validation.isValid) {
            console.log('❌ Ошибки валидации:', validation.errors);
            showValidationErrors(validation.errors);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        const cleanData = validation.cleanedData;
        cleanData.phone = ValidationRules.phone.clean(cleanData.phone);
        
        console.log('✅ Проверенные данные:', cleanData);
        
        // Добавляем метаданные для юридической значимости
        cleanData.legalMeta = {
            timestamp: new Date().toISOString(),
            documentsVersion: '1.0',
            consentGivenAt: new Date().toISOString(),
            // IP можно добавить позже через API
            userAgent: navigator.userAgent.substring(0, 200)
        };
        
        // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА ЦЕНЫ
        const price = parseInt(cleanData.price);
        if (!price || price < 500 || price > 100000) {
            throw new Error('Цена должна быть от 500 до 100000 ₽');
        }
        
        // ДЛЯ ВЫЕЗДНЫХ МАСТЕРОВ - очищаем адрес, даже если что-то введено
        if (workType === 'mobile') {
            cleanData.address = ''; // Принудительно очищаем
            console.log('🚗 Выездной мастер, адрес очищен');
        }
        
        // Отправляем на сервер
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        
        const response = await fetch('http://localhost:3001/api/masters/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanData)
        });
        
        
        console.log('📤 Ответ сервера:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        const result = await response.json();
        console.log('📄 Данные ответа:', result);
        
        if (!response.ok) {
            let errorMessage = result.error || 'Ошибка регистрации';
            
            // Добавляем подсказки если есть
            if (result.suggestion) {
                errorMessage += `\n\n${result.suggestion}`;
            }
            
            throw new Error(errorMessage);
        }
        
        console.log('✅ Регистрация успешна:', result);
        
        // Успешная регистрация
        showRegistrationSuccess(result);
        
        // Обновляем данные через 2 секунды
        setTimeout(async () => {
            try {
                await updateClientData();
            } catch (error) {
                console.warn('Не удалось обновить данные:', error);
            }
        }, 2000);
        
        // Закрываем модалку через 4 секунды
        setTimeout(() => {
            closeRegistrationModal();
        }, 4000);
        
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        
        // Форматируем ошибку для показа
        let cleanError = error.message;
        cleanError = cleanError.replace(/at HTMLFormElement\.handleRegistrationSubmit \(.*\)/, '');
        cleanError = cleanError.replace(/at Object\.<anonymous> \(.*\)/, '');
        
        // Показываем ошибку
        if (error.message.includes('валидации') || error.message.includes('Цена') || error.message.includes('адрес')) {
            // Это наша валидационная ошибка
            showRegistrationError(cleanError);
        } else {
            // Ошибка сервера
            showRegistrationError(cleanError);
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ФУНКЦИЯ ДЛЯ ПОКАЗА ОШИБОК ВАЛИДАЦИИ
function showValidationErrors(errors) {
    // Удаляем старые ошибки валидации
    document.querySelectorAll('.validation-error').forEach(el => {
        if (el.closest('#master-registration-form')) {
            el.remove();
        }
    });
    
    // Удаляем подсветку ошибок
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    
    // Показываем новые ошибки
    for (const [fieldName, message] of Object.entries(errors)) {
        const input = document.querySelector(`[name="${fieldName}"]`);
        if (input) {
            // Создаем элемент ошибки
            const errorEl = document.createElement('div');
            errorEl.className = 'validation-error';
            errorEl.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            `;
            
            // Вставляем после поля
            input.parentNode.insertBefore(errorEl, input.nextSibling);
            
            // Подсвечиваем поле
            input.classList.add('error');
            
            // Убираем ошибку при вводе
            input.addEventListener('input', function cleanup() {
                this.classList.remove('error');
                if (errorEl.parentNode) {
                    errorEl.parentNode.removeChild(errorEl);
                }
                this.removeEventListener('input', cleanup);
            }, { once: true });
        }
    }
    
    // Если есть ошибки, прокручиваем к первой
    if (Object.keys(errors).length > 0) {
        const firstErrorField = document.querySelector(`[name="${Object.keys(errors)[0]}"]`);
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
    }
}

// Обновление данных на клиенте
async function updateClientData() {
    console.log('🔄 Обновляем данные...');
    
    // Просто перезагружаем страницу через 2 секунды
    setTimeout(() => {
        console.log('🔄 Перезагрузка страницы для обновления данных...');
        window.location.reload();
    }, 2000);
    
    return true;
}

// Показ успешной регистрации
function showRegistrationSuccess(result) {
    const modalContent = document.querySelector('#master-registration-modal .modal__content');
    if (!modalContent) return;
    
    const hasAddress = result.data && result.data.address;
    const isGeocoded = result.data && result.data.geocoded;
    
    modalContent.innerHTML = `
        <div class="registration-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Вы в каталоге! 🎉</h3>
            
            ${isGeocoded ? 
                '<p class="success-geocoded">✅ Адрес найден на карте!</p>' : 
                hasAddress ? 
                '<p class="warning">⚠️ Адрес не найден точно</p>' :
                '<p>Выездной мастер</p>'
            }
            
            <div class="success-details">
                <div class="detail-item">
                    <i class="fas fa-user"></i>
                    <span><strong>${result.data.name}</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${formatPhone(result.data.phone)}</span>
                </div>
                ${hasAddress ? `
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${result.data.address}</span>
                    </div>
                ` : ''}
                <div class="detail-item">
                    <i class="fas fa-tag"></i>
                    <span>${result.data.price || 0}₽</span>
                </div>
            </div>
            
            <div class="success-notice">
                <i class="fas fa-info-circle"></i>
                <div>
                    <strong>Готово!</strong>
                    <p>Теперь клиенты могут вас найти и позвонить</p>
                </div>
            </div>
            
            <div class="success-actions">
                <button onclick="closeRegistrationModal()" class="btn btn-primary">
                    <i class="fas fa-thumbs-up"></i>
                    Супер!
                </button>
            </div>
        </div>
    `;
}

// Показ ошибки регистрации
function showRegistrationError(message) {
    const form = document.getElementById('master-registration-form');
    if (!form) return;
    
    // Удаляем старую ошибку если есть
    const oldError = form.parentNode.querySelector('.error-message');
    if (oldError) oldError.remove();
    
    // Создаем новую ошибку
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-alert">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>Ошибка:</strong>
                <p>${message}</p>
            </div>
        </div>
    `;
    
    // Вставляем перед формой
    form.parentNode.insertBefore(errorDiv, form);
    
    // Автоудаление через 10 секунд
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

// Форматирование телефона
function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
    }
    return phone;
}

// Добавление стилей для формы регистрации
function addRegistrationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .form-section {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .form-section:last-child {
            border-bottom: none;
        }
        
        .form-section-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }
        
        .form-section-title i {
            color: #3b82f6;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        @media (max-width: 640px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-secondary);
        }
        
        .form-hint {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.25rem;
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        .modal__textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
            font-family: inherit;
            resize: vertical;
            transition: border-color 0.2s;
        }
        
        .modal__textarea:focus {
            outline: none;
            border-color: #3b82f6;
        }
        
        .radio-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.75rem;
        }
        
        .radio-option {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .radio-option:hover {
            background: rgba(255, 255, 255, 0.08);
        }
        
        .radio-option input[type="radio"]:checked + span {
            color: #3b82f6;
        }
        
        .radio-option input[type="radio"]:checked ~ small {
            color: var(--text-primary);
        }
        
        .radio-option input[type="radio"] {
            display: none;
        }
        
        .radio-option span {
            font-weight: 500;
            margin-bottom: 0.25rem;
        }
        
        .radio-option small {
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .category-checkbox {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
        }
        
        .category-checkbox:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .category-checkbox input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }
        
        .form-notice.success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 1rem;
            border-radius: 8px;
            margin: 1.5rem 0;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        
        .form-notice.success i {
            color: #10b981;
            margin-top: 0.25rem;
        }
        
        .error-alert {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        
        .error-alert i {
            color: #ef4444;
            margin-top: 0.25rem;
        }
        
        .error-alert p {
            margin: 0.25rem 0 0 0;
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
        
        .success-geocoded {
            color: #10b981;
            font-weight: bold;
            margin: 1rem 0;
        }
        
        .success-details {
            background: rgba(59, 130, 246, 0.05);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin: 0.75rem 0;
            padding: 0.5rem;
        }
        
        .detail-item i {
            color: #6b7280;
            width: 20px;
        }
        
        .success-notice {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
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
        
        .success-actions {
            margin-top: 2rem;
        }
        
        .warning {
            color: #f59e0b;
        }
        
        /* ===== СТИЛИ ДЛЯ ЮРИДИЧЕСКИХ СОГЛАСИЙ ===== */
        .legal-agreements {
            background: rgba(59, 130, 246, 0.05);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        .legal-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        }
        
        .legal-checkbox:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(59, 130, 246, 0.3);
        }
        
        .legal-checkbox input[type="checkbox"] {
            margin-top: 0.25rem;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .checkbox-content {
            flex: 1;
        }
        
        .checkbox-label {
            display: block;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }
        
        .checkbox-description {
            display: block;
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        .legal-link {
            color: #3b82f6;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: all 0.2s;
        }
        
        .legal-link:hover {
            border-bottom-color: #3b82f6;
        }
        
        .legal-info {
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .legal-info h5 {
            margin-bottom: 0.75rem;
            color: var(--text-primary);
            font-size: 0.95rem;
        }
        
        .legal-info ul {
            margin: 0;
            padding-left: 1.25rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .legal-info li {
            margin-bottom: 0.5rem;
        }
        
        /* ===== ВАЛИДАЦИЯ ===== */
        .validation-error {
            margin-top: 0.5rem;
            padding: 0.75rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            color: #ef4444;
            font-size: 0.9rem;
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .validation-error i {
            margin-top: 0.125rem;
        }
        
        .validation-error ul {
            margin: 0.5rem 0 0 1rem;
            padding-left: 1rem;
        }
        
        .validation-error li {
            margin-bottom: 0.25rem;
        }
        
        /* Ошибки полей */
        input.error,
        textarea.error,
        select.error,
        .legal-checkbox.error {
            border-color: #ef4444 !important;
            background: rgba(239, 68, 68, 0.05) !important;
        }
        
        input.error:focus,
        textarea.error:focus,
        select.error:focus {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
        }
        
        .legal-checkbox.error {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Счетчик символов */
        .char-counter {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-align: right;
            margin-top: 0.25rem;
        }
        
        .char-counter.warning {
            color: #f59e0b;
        }
        
        .char-counter.error {
            color: #ef4444;
            font-weight: bold;
        }
        
        /* Для мобильных устройств */
        @media (max-width: 640px) {
            .legal-agreements {
                padding: 1rem;
            }
            
            .legal-checkbox {
                padding: 0.75rem;
            }
            
            .checkbox-label {
                font-size: 0.95rem;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Делаем функции доступными глобально
window.openRegistrationModal = openRegistrationModal;
window.closeRegistrationModal = closeRegistrationModal;
window.updateClientData = updateClientData;
