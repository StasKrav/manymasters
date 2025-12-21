// Форматирование цены
export function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

// Дебаунс для оптимизации
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Анимация элемента
export function animateCSS(element, animationName, callback) {
    const prefix = 'animate__';
    
    // Создаем классы для анимации
    element.classList.add(`${prefix}animated`, `${prefix}${animationName}`);
    
    // Удаляем классы после завершения анимации
    function handleAnimationEnd(event) {
        event.stopPropagation();
        element.classList.remove(`${prefix}animated`, `${prefix}${animationName}`);
        element.removeEventListener('animationend', handleAnimationEnd);
        
        if (typeof callback === 'function') {
            callback();
        }
    }
    
    element.addEventListener('animationend', handleAnimationEnd, { once: true });
}

// Форматирование времени
export function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} мин`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours} ч`;
    }
    
    return `${hours} ч ${remainingMinutes} мин`;
}

// Валидация телефона
export function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 && /^[78]/.test(cleaned);
}

// Валидация email
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Генерация уникального ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Сохранение в LocalStorage
export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения в LocalStorage:', error);
        return false;
    }
}

// Загрузка из LocalStorage
export function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Ошибка загрузки из LocalStorage:', error);
        return null;
    }
}

// Копирование в буфер обмена
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Ошибка копирования в буфер:', error);
        return false;
    }
}

// Получение текущей геолокации
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Геолокация не поддерживается'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Определение мобильного устройства
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Определение темной темы
export function isDarkThemePreferred() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
