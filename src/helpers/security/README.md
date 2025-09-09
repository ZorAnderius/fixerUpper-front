# Security Utilities

Цей модуль містить утиліти для забезпечення безпеки фронтенд додатку.

## Компоненти

### SafeHTML
Безпечний компонент для відображення HTML контенту з санітизацією.

```jsx
import SafeHTML from '../../components/SafeHTML/SafeHTML';

<SafeHTML 
  content="<p>Safe HTML content</p>" 
  allowedTags={['p', 'br', 'strong']}
/>
```

### SecureForm
Форма з вбудованими заходами безпеки:
- Санітизація вводу
- Валідація паролів
- Захист від брутфорсу
- Блокування після невдалих спроб

```jsx
import SecureForm from '../../components/SecureForm/SecureForm';

<SecureForm onSubmit={handleSubmit} maxAttempts={5}>
  {/* Form fields */}
</SecureForm>
```

### SecureFileUpload
Безпечний компонент для завантаження файлів:
- Валідація типів файлів
- Перевірка розміру
- Захист від шкідливих розширень

```jsx
import SecureFileUpload from '../../components/SecureFileUpload/SecureFileUpload';

<SecureFileUpload 
  onFileSelect={handleFileSelect}
  maxSize={5 * 1024 * 1024}
  accept="image/*"
/>
```

### UserContent
Компонент для безпечного відображення користувацького контенту.

```jsx
import UserContent from '../../components/UserContent/UserContent';

<UserContent 
  content={userInput}
  type="text"
  maxLength={500}
/>
```

## Утиліти

### Санітизація

#### sanitizeHTML(dirty, options)
Санітизує HTML контент для запобігання XSS атак.

```js
import { sanitizeHTML } from '../../helpers/security/sanitize';

const clean = sanitizeHTML('<script>alert("xss")</script><p>Safe content</p>');
// Result: '<p>Safe content</p>'
```

#### sanitizeText(text)
Екранує HTML сутності в тексті.

```js
import { sanitizeText } from '../../helpers/security/sanitize';

const safe = sanitizeText('<script>alert("xss")</script>');
// Result: '&lt;script&gt;alert("xss")&lt;/script&gt;'
```

#### sanitizeInput(input, maxLength)
Санітизує користувацький ввід.

```js
import { sanitizeInput } from '../../helpers/security/sanitize';

const clean = sanitizeInput('  user input  ', 100);
// Result: 'user input'
```

#### sanitizeEmail(email)
Валідує та санітизує email адресу.

```js
import { sanitizeEmail } from '../../helpers/security/sanitize';

const email = sanitizeEmail('user@example.com');
// Result: 'user@example.com' or null if invalid
```

#### sanitizePhone(phone)
Валідує та санітизує номер телефону.

```js
import { sanitizePhone } from '../../helpers/security/sanitize';

const phone = sanitizePhone('+380671234567');
// Result: '+380671234567' or null if invalid
```

### Валідація

#### validateFileUpload(file, allowedTypes, maxSize)
Валідує завантажені файли.

```js
import { validateFileUpload } from '../../helpers/security/validation';

const result = validateFileUpload(file, ['image/jpeg', 'image/png'], 5 * 1024 * 1024);
if (result.isValid) {
  // File is safe
} else {
  console.log(result.errors);
}
```

#### validatePasswordStrength(password)
Перевіряє надійність пароля.

```js
import { validatePasswordStrength } from '../../helpers/security/validation';

const result = validatePasswordStrength('MyPassword123!');
if (result.isValid) {
  // Password is strong
} else {
  console.log(result.feedback);
}
```

#### RateLimiter
Клас для обмеження кількості запитів.

```js
import { RateLimiter } from '../../helpers/security/validation';

const limiter = new RateLimiter(100, 60000); // 100 requests per minute

if (limiter.isAllowed('user123')) {
  // Allow request
} else {
  // Block request
}
```

## Хуки

### useSecureStorage
Безпечний хук для роботи з localStorage.

```js
import { useSecureStorage } from '../../hooks/useSecureStorage';

const [value, setValue, removeValue] = useSecureStorage('key', 'default', {
  maxSize: 1024,
  validate: (val) => typeof val === 'string'
});
```

### useSecureSessionStorage
Безпечний хук для роботи з sessionStorage.

```js
import { useSecureSessionStorage } from '../../hooks/useSecureStorage';

const [value, setValue, removeValue] = useSecureSessionStorage('key', 'default');
```

## Конфігурація безпеки

### CSP (Content Security Policy)
Налаштування CSP для запобігання XSS атак.

```js
import { CSP_CONFIG } from '../../helpers/security/headers';

// Used in meta tags or HTTP headers
```

### CORS
Налаштування CORS для API.

```js
import { CORS_CONFIG } from '../../helpers/security/headers';

// Used on backend
```

### Rate Limiting
Налаштування обмеження швидкості.

```js
import { RATE_LIMIT_CONFIG } from '../../helpers/security/headers';

// Used on backend
```

## Рекомендації

1. **Завжди санітизуйте** користувацький ввід перед відображенням
2. **Валідуйте файли** перед завантаженням
3. **Використовуйте HTTPS** в продакшені
4. **Обмежуйте швидкість** API запитів
5. **Регулярно оновлюйте** залежності
6. **Логуйте** підозрілу активність
7. **Тестуйте** безпеку регулярно

## Захист від атак

### XSS (Cross-Site Scripting)
- Використовуйте `sanitizeHTML` для HTML контенту
- Використовуйте `sanitizeText` для звичайного тексту
- Налаштуйте CSP заголовки

### CSRF (Cross-Site Request Forgery)
- Використовуйте CSRF токени
- Перевіряйте Origin заголовки
- Використовуйте SameSite cookies

### Injection атаки
- Санітизуйте всі входи
- Використовуйте параметризовані запити
- Валідуйте дані на клієнті та сервері

### File Upload атаки
- Валідуйте типи файлів
- Перевіряйте розмір файлів
- Скануйте на віруси
- Зберігайте файли поза web root



