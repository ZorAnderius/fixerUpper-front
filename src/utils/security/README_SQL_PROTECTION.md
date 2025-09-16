# SQL Injection Protection

Додатковий захист від SQL injection для frontend, який працює разом з існуючими утилітами без порушення функціональності.

## Особливості

- ✅ **Не ламає існуючий код** - працює як додатковий шар захисту
- ✅ **Детекція загроз** - виявляє SQL injection спроби
- ✅ **Автоматична санітизація** - очищає небезпечні символи
- ✅ **Валідація вводу** - перевіряє дані перед відправкою
- ✅ **Логування загроз** - відстежує спроби атак
- ✅ **Легка інтеграція** - хук та компоненти-обгортки

## Швидкий старт

### 1. Використання хука

```jsx
import { useSQLProtection } from '../hooks/useSQLProtection';

function MyForm() {
  const { protectInput, createProtectedHandler } = useSQLProtection({
    sanitize: true,
    validate: true,
    logThreats: true
  });

  const handleInputChange = (event) => {
    const protection = protectInput(event.target.value);
    if (!protection.isSafe) {
      console.warn('SQL injection threat detected!');
    }
    // Використовуйте protection.protectedValue
  };

  return (
    <input 
      onChange={createProtectedHandler(handleInputChange)}
      placeholder="Enter text..."
    />
  );
}
```

### 2. Використання компонентів-обгорток

```jsx
import { 
  SQLProtectionProvider, 
  ProtectedForm, 
  ProtectedInput 
} from '../components/SQLProtectionWrapper/SQLProtectionWrapper';

function App() {
  return (
    <SQLProtectionProvider options={{ sanitize: true, logThreats: true }}>
      <ProtectedForm onSubmit={handleSubmit}>
        <ProtectedInput>
          <input name="username" placeholder="Username" />
        </ProtectedInput>
        <button type="submit">Submit</button>
      </ProtectedForm>
    </SQLProtectionProvider>
  );
}
```

### 3. Пряме використання утиліт

```jsx
import { 
  detectSQLInjection, 
  sanitizeSQLInput, 
  validateSQLInput 
} from '../utils/security/sqlInjectionProtection';

// Детекція загроз
const detection = detectSQLInjection("SELECT * FROM users");
console.log(detection.isSafe); // false
console.log(detection.riskLevel); // 'high'

// Санітизація
const sanitized = sanitizeSQLInput("test'value");
console.log(sanitized); // 'testvalue'

// Валідація
const validation = validateSQLInput("test'value", {
  strictMode: true,
  maxLength: 255
});
console.log(validation.isValid); // false
```

## API Довідка

### useSQLProtection(options)

Хук для захисту від SQL injection.

**Параметри:**
- `sanitize` (boolean) - Автоматично очищати ввід
- `validate` (boolean) - Валідувати ввід
- `strictMode` (boolean) - Строгий режим валідації
- `maxLength` (number) - Максимальна довжина вводу
- `onThreatDetected` (function) - Колбек при виявленні загрози
- `logThreats` (boolean) - Логувати загрози в консоль

**Повертає:**
- `protectInput(value)` - Захистити ввід
- `createProtectedHandler(handler)` - Створити захищений обробник
- `validateInputs(inputs)` - Валідувати кілька вводів
- `getThreatStats()` - Статистика загроз

### detectSQLInjection(input)

Виявляє SQL injection спроби в тексті.

**Параметри:**
- `input` (string) - Текст для перевірки

**Повертає:**
```javascript
{
  isSafe: boolean,
  threats: Array<{
    type: string,
    pattern: string,
    severity: 'high'|'medium'|'low',
    description: string
  }>,
  riskLevel: 'none'|'low'|'medium'|'high',
  sanitizedInput: string
}
```

### sanitizeSQLInput(input)

Очищає ввід від SQL injection загроз.

**Параметри:**
- `input` (string) - Текст для очищення

**Повертає:** Очищений текст

### validateSQLInput(input, options)

Валідує ввід на відповідність критеріям безпеки.

**Параметри:**
- `input` (string) - Текст для валідації
- `options` (object) - Опції валідації

**Повертає:**
```javascript
{
  isValid: boolean,
  errors: string[],
  detection: object,
  sanitizedInput: string
}
```

## Виявлені загрози

Система виявляє наступні типи SQL injection:

### Високий рівень ризику
- SQL ключові слова (SELECT, INSERT, UPDATE, DELETE, DROP)
- SQL оператори (UNION, OR, AND)
- Спроби SQL injection
- Time-based injection
- Boolean-based injection

### Середній рівень ризику
- SQL функції
- SQL коментарі та термінатори рядків
- SQL wildcards
- SQL оператори порівняння

### Низький рівень ризику
- Stacked queries
- Comment-based injection
- Hex/URL encoding спроби
- Підозрілі символи

## Інтеграція з існуючими формами

### Formik

```jsx
import { useSQLProtection } from '../hooks/useSQLProtection';

function MyFormikForm() {
  const { createProtectedHandler } = useSQLProtection();

  return (
    <Formik>
      {({ setFieldValue }) => (
        <Form>
          <Field
            name="username"
            render={({ field }) => (
              <input
                {...field}
                onChange={createProtectedHandler((e) => {
                  field.onChange(e);
                  setFieldValue('username', e.target.value);
                })}
              />
            )}
          />
        </Form>
      )}
    </Formik>
  );
}
```

### React Hook Form

```jsx
import { useSQLProtection } from '../hooks/useSQLProtection';

function MyRHFForm() {
  const { register } = useForm();
  const { createProtectedHandler } = useSQLProtection();

  return (
    <form>
      <input
        {...register('username')}
        onChange={createProtectedHandler(register('username').onChange)}
      />
    </form>
  );
}
```

## Налаштування

### Глобальні налаштування

```jsx
// В App.jsx
import { SQLProtectionProvider } from './components/SQLProtectionWrapper/SQLProtectionWrapper';

function App() {
  return (
    <SQLProtectionProvider
      options={{
        sanitize: true,
        validate: true,
        strictMode: false,
        maxLength: 255,
        logThreats: process.env.NODE_ENV === 'development',
        onThreatDetected: (detection) => {
          // Відправити аналітику
          analytics.track('sql_injection_attempt', {
            riskLevel: detection.riskLevel,
            threatCount: detection.threats.length
          });
        }
      }}
    >
      {/* Ваші компоненти */}
    </SQLProtectionProvider>
  );
}
```

## Тестування

```bash
npm test -- sqlInjectionProtection.test.js
```

## Безпека

⚠️ **Важливо:** Цей захист працює тільки на frontend рівні. Обов'язково використовуйте:

1. **Backend валідацію** - завжди валідуйте дані на сервері
2. **Parameterized queries** - використовуйте підготовлені запити
3. **Input sanitization** - очищайте дані перед збереженням
4. **Output encoding** - кодуйте дані при виводі

Цей захист є **додатковим шаром** безпеки, а не заміною backend захисту.
