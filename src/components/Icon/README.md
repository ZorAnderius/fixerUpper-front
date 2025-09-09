# Icon Component

Універсальний компонент для відображення SVG іконок з спрайту.

## Використання

```jsx
import Icon from '../../components/Icon/Icon';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';

// Basic usage
<Icon name="user" />

// With size
<Icon name="phone" size="lg" />

// With custom color
<Icon name="facebook" color="#1877f2" />

// With additional classes
<Icon name="instagram" className="custom-class" />

// Using constants
<Icon name={ICONS.USER} size={ICON_SIZES.MD} />
```

## Доступні іконки

- `user` - іконка користувача
- `chevron-select` - стрілка для селектів
- `chevron` - загальна стрілка
- `phone` - телефон
- `filter` - фільтр
- `location` - локація
- `facebook` - Facebook
- `instagram` - Instagram
- `youtube` - YouTube

## Розміри

- `xs` - 12px
- `sm` - 16px
- `md` - 20px (за замовчуванням)
- `lg` - 24px
- `xl` - 32px
- `2xl` - 40px
- `3xl` - 48px

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `name` | `string` | - | Назва іконки (обов'язково) |
| `size` | `string` | `'md'` | Розмір іконки |
| `color` | `string` | `'currentColor'` | Колір іконки |
| `className` | `string` | `''` | Додаткові CSS класи |

## Приклади

### Соціальні мережі
```jsx
<div className="social-buttons">
  <Icon name={ICONS.FACEBOOK} size={ICON_SIZES.MD} />
  <Icon name={ICONS.INSTAGRAM} size={ICON_SIZES.MD} />
  <Icon name={ICONS.YOUTUBE} size={ICON_SIZES.MD} />
</div>
```

### Контактна інформація
```jsx
<div className="contact-info">
  <Icon name={ICONS.PHONE} size={ICON_SIZES.SM} />
  <span>+380 (67) 123-45-67</span>
</div>
```

### Навігація
```jsx
<button className="dropdown-toggle">
  <span>Категорії</span>
  <Icon name={ICONS.CHEVRON_SELECT} size={ICON_SIZES.SM} />
</button>
```

## Додавання нових іконок

1. Додайте новий `<symbol>` до спрайту в `index.html`
2. Додайте константу до `src/helpers/constants/icons.js`
3. Використовуйте нову іконку через компонент

```jsx
// In icons.js
export const ICONS = Object.freeze({
  // ... existing icons
  NEW_ICON: 'new-icon',
});

// Usage
<Icon name={ICONS.NEW_ICON} size={ICON_SIZES.MD} />
```



