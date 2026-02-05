// validation.js - ОБНОВЛЕННАЯ ВЕРСИЯ С ЮРИДИЧЕСКИМИ СОГЛАСИЯМИ
export const ValidationRules = {
  phone: {
    pattern: /^[78]\d{10}$/,
    message: 'Введите 11 цифр, начинается с 7 или 8',
    format: (value) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length === 11) {
        return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`
      }
      return digits
    },
    clean: (value) => value.replace(/\D/g, '')
  },
  
  name: {
    pattern: /^[А-ЯЁа-яё\s\-]{2,50}$/,
    message: 'Только русские буквы, пробелы и дефис (2-50 символов)',
    clean: (value) => value.trim().replace(/\s+/g, ' ')
  },
  
  price: {
    pattern: /^\d{3,6}$/,
    validate: (value) => {
      const num = parseInt(value)
      return num >= 500 && num <= 100000
    },
    message: 'Цена от 500 до 100 000 ₽'
  },
  
  description: {
    pattern: /^[А-ЯЁа-яё0-9\s\.,!?;\-:"'()\n]{0,2000}$/, // 0-2000, может быть пустым
    validate: (value) => {
      const words = value.trim().split(/\s+/).filter(w => w.length > 0)
      return words.length <= 100
    },
    message: 'Максимум 100 слов',
    clean: (value) => value.trim().replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n')
  },
  
  services: {
    pattern: /^[А-ЯЁа-яё0-9\s\.,\-]{5,200}$/,
    message: 'Только русские буквы, цифры и запятые (5-200 символов)',
    clean: (value) => value.trim().replace(/\s*,\s*/g, ', ').replace(/,{2,}/g, ',')
  },
  
  address: {
    // Адрес может быть пустым или соответствовать паттерну
    pattern: /^[А-ЯЁа-яё0-9\s\.,\-/\\]{0,100}$/, // 0-100 символов, может быть пустым
    message: 'Только русские буквы, цифры и знаки препинания (макс. 100 символов)',
    clean: (value) => value.trim()
  },
  
  workType: {
    // Только mobile или stationary
    validate: (value) => ['mobile', 'stationary'].includes(value),
    message: 'Выберите тип работы'
  },
  
  // Юридические согласия
  termsAgreement: {
    validate: (value) => value === true || value === 'on',
    message: 'Необходимо принять пользовательское соглашение'
  },
  
  privacyAgreement: {
    validate: (value) => value === true || value === 'on',
    message: 'Необходимо принять политику конфиденциальности'
  },
  
  pdAgreement: {
    validate: (value) => value === true || value === 'on',
    message: 'Необходимо дать согласие на обработку персональных данных'
  }
}

export class Validator {
  static validate(fieldName, value, rules = ValidationRules) {
    const rule = rules[fieldName]
    if (!rule) return { valid: true }
    
    // Если значение пустое и это поле description или address - пропускаем
    if ((fieldName === 'description' || fieldName === 'address') && value.trim() === '') {
      return { valid: true, cleaned: '' }
    }
    
    const cleaned = rule.clean ? rule.clean(value) : value.trim()
    
    // Для пустого адреса - проверяем только если есть pattern
    if (fieldName === 'address' && cleaned === '' && rule.pattern) {
      return rule.pattern.test('') ? { valid: true, cleaned } : { valid: false, message: rule.message, cleaned }
    }
    
    if (rule.pattern && !rule.pattern.test(cleaned)) {
      return { 
        valid: false, 
        message: rule.message,
        cleaned 
      }
    }
    
    if (rule.validate && !rule.validate(cleaned)) {
      return { 
        valid: false, 
        message: rule.message,
        cleaned 
      }
    }
    
    return { valid: true, cleaned }
  }
  
  // Валидация с учетом workType (адрес обязателен только для stationary)
  static validateForm(formData, rules = ValidationRules) {
    const errors = {}
    const cleanedData = {}
    const workType = formData.workType
    
    // Список юридических полей (обязательные всегда)
    const legalFields = ['termsAgreement', 'privacyAgreement', 'pdAgreement']
    
    for (const [field, value] of Object.entries(formData)) {
      if (rules[field]) {
        // Особый случай: юридические поля
        if (legalFields.includes(field)) {
          if (value !== true && value !== 'on') {
            errors[field] = rules[field].message
          }
          cleanedData[field] = value === 'on' ? true : value
          continue
        }
        
        // Особый случай: адрес для выездных мастеров
        if (field === 'address' && workType === 'mobile') {
          cleanedData[field] = value.trim()
          continue // Пропускаем валидацию адреса для выездных
        }
        
        const result = this.validate(field, value, rules)
        if (!result.valid) {
          errors[field] = result.message
        }
        cleanedData[field] = result.cleaned || value
      } else {
        cleanedData[field] = value
      }
    }
    
    // Дополнительная проверка: адрес обязателен для стационарных мастеров
    if (workType === 'stationary' && (!formData.address || formData.address.trim() === '')) {
      errors.address = 'Для мастеров с мастерской укажите адрес'
    }
    
    // Проверяем все юридические согласия
    legalFields.forEach(field => {
      if (!formData[field] || (formData[field] !== true && formData[field] !== 'on')) {
        errors[field] = rules[field]?.message || 'Необходимо согласие'
      }
    })
    
    return { isValid: Object.keys(errors).length === 0, errors, cleanedData }
  }
}
