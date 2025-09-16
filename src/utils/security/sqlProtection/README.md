# SQL Injection Protection - Modular Structure

Захист від SQL injection розділено на окремі модулі для кращої організації, підтримки та дебагу.

## Структура файлів

```
src/utils/security/sqlProtection/
├── index.js              # Головний індекс з експортами
├── detection.js          # Модуль детекції загроз
├── sanitization.js       # Модуль санітизації
├── validation.js         # Модуль валідації
├── handlers.js           # Модуль обробників
├── constants.js          # Константи та конфігурація
└── README.md            # Документація
```

## Модулі

### 1. Detection (`detection.js`)
**Відповідальність:** Виявлення потенційних SQL injection загроз

**Основні функції:**
- `detectSQLInjection(input)` - детекція загроз
- `SQL_INJECTION_PATTERNS` - масив патернів для виявлення
- `SQL_SPECIAL_CHARS` - спеціальні SQL символи

**Використання:**
```javascript
import { detectSQLInjection } from './detection.js';

const result = detectSQLInjection("SELECT * FROM users");
console.log(result.isSafe); // false
console.log(result.riskLevel); // 'high'
```

### 2. Sanitization (`sanitization.js`)
**Відповідальність:** Очищення та санітизація вводу

**Основні функції:**
- `sanitizeSQLInput(input)` - основна санітизація
- `removeSpecialCharacters(input)` - видалення спеціальних символів
- `removeSQLKeywords(input)` - видалення SQL ключових слів
- `escapeSQLInput(input)` - екранування символів
- `cleanInputForDatabase(input, options)` - комплексне очищення

**Використання:**
```javascript
import { sanitizeSQLInput, removeSQLKeywords } from './sanitization.js';

const clean = sanitizeSQLInput("test'value");
console.log(clean); // 'testvalue'

const noKeywords = removeSQLKeywords("SELECT name FROM users");
console.log(noKeywords); // 'name users'
```

### 3. Validation (`validation.js`)
**Відповідальність:** Валідація вводу проти SQL injection

**Основні функції:**
- `validateSQLInput(input, options)` - валідація з опціями
- `validateCustomPatterns(input, patterns)` - валідація кастомних патернів
- `validateWhitelistPatterns(input, patterns)` - валідація whitelist
- `validateMultipleInputs(inputs, options)` - валідація кількох вводів
- `createValidationRules(rules)` - створення правил валідації

**Використання:**
```javascript
import { validateSQLInput, createValidationRules } from './validation.js';

const validation = validateSQLInput("test'value", {
  strictMode: true,
  maxLength: 100
});

const rules = createValidationRules({
  minLength: 3,
  maxLength: 50,
  allowedPatterns: [/^[a-zA-Z0-9]+$/]
});
```

### 4. Handlers (`handlers.js`)
**Відповідальність:** Створення захищених обробників для форм та вводу

**Основні функції:**
- `createSafeInputHandler(handler, options)` - захищений обробник вводу
- `createProtectedFormHandler(handler, options)` - захищений обробник форми
- `createProtectedChangeHandler(handler, options)` - захищений обробник зміни
- `createProtectedSetter(setter, options)` - захищений setter
- `createBatchProcessor(options)` - батчовий процесор

**Використання:**
```javascript
import { createSafeInputHandler, createProtectedFormHandler } from './handlers.js';

const safeHandler = createSafeInputHandler(originalHandler, {
  sanitize: true,
  validate: true,
  logThreats: true
});

const formHandler = createProtectedFormHandler(originalFormHandler, {
  blockSubmission: true,
  sanitize: true
});
```

### 5. Constants (`constants.js`)
**Відповідальність:** Константи, конфігурації та налаштування

**Основні експорти:**
- `DEFAULT_CONFIG` - конфігурація за замовчуванням
- `CONFIG_PRESETS` - готові пресети конфігурації
- `SQL_KEYWORDS` - SQL ключові слова по категоріях
- `DEFAULT_PATTERNS` - стандартні патерни валідації
- `ERROR_MESSAGES` - повідомлення про помилки

**Використання:**
```javascript
import { CONFIG_PRESETS, SQL_KEYWORDS, DEFAULT_PATTERNS } from './constants.js';

// Використання строгого режиму
const strictConfig = CONFIG_PRESETS.STRICT;

// Перевірка email
const isValidEmail = DEFAULT_PATTERNS.EMAIL.test("user@example.com");
```

## Переваги модульної структури

### ✅ **Краща організація**
- Кожен модуль має чітку відповідальність
- Легко знайти потрібну функціональність
- Логічне групування функцій

### ✅ **Простіший дебаг**
- Помилки локалізовані в конкретному модулі
- Можна тестувати кожен модуль окремо
- Чіткий стек викликів

### ✅ **Краща підтримка**
- Зміни в одному модулі не впливають на інші
- Можна розширювати функціональність по модулях
- Легше додавати нові функції

### ✅ **Гнучкість використання**
- Можна імпортувати тільки потрібні функції
- Менший розмір bundle при tree-shaking
- Можна налаштовувати кожен модуль окремо

## Приклади використання

### Базове використання
```javascript
import { detectSQLInjection, sanitizeSQLInput } from './sqlProtection';

// Детекція
const detection = detectSQLInjection(userInput);

// Санітизація
const cleanInput = sanitizeSQLInput(userInput);
```

### Розширене використання
```javascript
import { 
  detectSQLInjection,
  validateSQLInput,
  createSafeInputHandler,
  CONFIG_PRESETS 
} from './sqlProtection';

// Використання строгого режиму
const config = CONFIG_PRESETS.STRICT;

// Створення захищеного обробника
const safeHandler = createSafeInputHandler(originalHandler, config);

// Валідація з кастомними правилами
const validation = validateSQLInput(input, {
  maxLength: 100,
  strictMode: true,
  customPatterns: [/forbidden/]
});
```

### Інтеграція в React
```javascript
import { useSQLProtection } from '../hooks/useSQLProtection';
import { CONFIG_PRESETS } from '../utils/security/sqlProtection';

function MyComponent() {
  const { protectInput, createProtectedHandler } = useSQLProtection(
    CONFIG_PRESETS.MODERATE
  );

  const handleInput = createProtectedHandler((value) => {
    setInput(value);
  });

  return <input onChange={handleInput} />;
}
```

## Тестування

Кожен модуль можна тестувати окремо:

```javascript
// Тест детекції
import { detectSQLInjection } from './detection.js';

// Тест санітизації
import { sanitizeSQLInput } from './sanitization.js';

// Тест валідації
import { validateSQLInput } from './validation.js';
```

## Міграція з монолітного файлу

Старий імпорт:
```javascript
import { detectSQLInjection } from './sqlInjectionProtection.js';
```

Новий імпорт:
```javascript
import { detectSQLInjection } from './sqlProtection/index.js';
// або
import { detectSQLInjection } from './sqlProtection';
```

Всі функції залишились з тими ж назвами та сигнатурами, тому міграція проста!
