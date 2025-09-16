# Комплексна система захисту від DDoS, Brute Force та Бот-атак

## 🛡️ Огляд системи

Створено повноцінну систему захисту, яка включає:

### ✅ **Компоненти системи:**

1. **Rate Limiting** - захист від DDoS та надмірного навантаження
2. **Brute Force Protection** - захист від атак підбору паролів
3. **Bot Detection** - виявлення та блокування ботів
4. **Security Headers** - заголовки безпеки для браузера
5. **Monitoring & Alerting** - моніторинг та сповіщення про загрози
6. **React Hook Integration** - легка інтеграція в React додатки

---

## 🚀 **Найкращі практики для оптимізації та безпеки**

### **1. Frontend Оптимізація**

#### **A. Rate Limiting на Frontend**
```javascript
import { useSecurity } from '../hooks/useSecurity';

function LoginForm() {
  const { checkAuthRateLimit, recordFailedAuth, recordSuccessfulAuth } = useSecurity();

  const handleLogin = async (credentials) => {
    // Перевірка rate limit перед відправкою
    const rateLimitCheck = checkAuthRateLimit(credentials.username);
    
    if (!rateLimitCheck.allowed) {
      alert(`Спробуйте пізніше. Блокування до: ${new Date(rateLimitCheck.retryAfter)}`);
      return;
    }

    try {
      const response = await loginAPI(credentials);
      recordSuccessfulAuth(credentials.username);
      // Успішний логін
    } catch (error) {
      recordFailedAuth(credentials.username, { endpoint: 'login' });
      // Обробка помилки
    }
  };
}
```

#### **B. Bot Detection Integration**
```javascript
import { useSecurity } from '../hooks/useSecurity';

function ContactForm() {
  const { analyzeRequest, generateCAPTCHA, verifyCAPTCHA } = useSecurity();
  const [captchaChallenge, setCaptchaChallenge] = useState(null);

  const handleSubmit = async (formData) => {
    // Аналіз поведінки користувача
    const botAnalysis = analyzeRequest({
      mouseMovements: collectMouseMovements(),
      keystrokeTiming: collectKeystrokeTiming(),
      timeOnPage: Date.now() - pageLoadTime
    });

    if (botAnalysis.requiresCAPTCHA) {
      const challenge = generateCAPTCHA();
      setCaptchaChallenge(challenge);
      return;
    }

    // Відправка форми
    await submitForm(formData);
  };
}
```

### **2. Backend Інтеграція**

#### **A. API Rate Limiting Middleware**
```javascript
// Express.js middleware
const rateLimitMiddleware = (req, res, next) => {
  const identifier = req.ip || req.connection.remoteAddress;
  
  // Використання rate limiter
  const rateLimitCheck = rateLimiter.checkRateLimit(identifier, {
    endpoint: req.path,
    method: req.method
  });

  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: rateLimitCheck.retryAfter
    });
  }

  // Додавання заголовків rate limiting
  Object.entries(rateLimitCheck.headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  next();
};
```

#### **B. Security Headers Middleware**
```javascript
const securityHeadersMiddleware = (req, res, next) => {
  const headers = securityHeaders.generateSecurityHeaders({
    csp: securityHeaders.generateCSP({
      'script-src': ["'self'", "'nonce-{nonce}'"],
      'connect-src': ["'self'", 'https://api.example.com']
    })
  });

  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  next();
};
```

### **3. Database Security**

#### **A. Connection Pooling**
```javascript
// Налаштування connection pool для захисту від DDoS
const poolConfig = {
  max: 20, // Максимум з'єднань
  min: 5,  // Мінімум з'єднань
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200
};
```

#### **B. Query Rate Limiting**
```javascript
// Обмеження кількості запитів до БД
const queryRateLimit = new Map();

const dbQueryMiddleware = (query, params) => {
  const identifier = getClientIdentifier();
  const now = Date.now();
  
  // Перевірка rate limit для БД запитів
  const queries = queryRateLimit.get(identifier) || [];
  const recentQueries = queries.filter(timestamp => now - timestamp < 60000); // 1 хвилина
  
  if (recentQueries.length > 100) { // 100 запитів на хвилину
    throw new Error('Database query rate limit exceeded');
  }
  
  recentQueries.push(now);
  queryRateLimit.set(identifier, recentQueries);
  
  return executeQuery(query, params);
};
```

---

## 🔧 **Конфігурація для різних середовищ**

### **Development Environment**
```javascript
const devConfig = {
  rateLimiting: {
    windowMs: 60 * 1000, // 1 хвилина
    maxRequests: 1000,   // Більше запитів для розробки
    blockDuration: 60 * 1000 // Коротше блокування
  },
  botDetection: {
    enableCAPTCHA: false, // Вимкнути CAPTCHA для розробки
    suspiciousThreshold: 0.9 // Вищий поріг
  },
  monitoring: {
    enableAlerting: false, // Вимкнути сповіщення
    logLevel: 'debug'
  }
};
```

### **Production Environment**
```javascript
const prodConfig = {
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 хвилин
    maxRequests: 100,          // Строгіше обмеження
    blockDuration: 60 * 60 * 1000 // 1 година блокування
  },
  botDetection: {
    enableCAPTCHA: true,
    suspiciousThreshold: 0.7,
    autoBlockThreshold: 0.9
  },
  monitoring: {
    enableAlerting: true,
    enableRealTimeMonitoring: true,
    alertThresholds: {
      highRiskScore: 0.8,
      rapidRequests: 50 // Менше запитів для сповіщення
    }
  }
};
```

---

## 📊 **Моніторинг та Аналітика**

### **A. Real-time Dashboard**
```javascript
import { useSecurity } from '../hooks/useSecurity';

function SecurityDashboard() {
  const { getDashboardData, securityStats } = useSecurity();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDashboardData(24 * 60 * 60 * 1000); // 24 години
      setDashboardData(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Оновлення кожні 30 секунд
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="security-dashboard">
      <div className="stats-grid">
        <StatCard title="Total Requests" value={securityStats.totalRequests} />
        <StatCard title="Blocked Requests" value={securityStats.blockedRequests} />
        <StatCard title="Bot Detections" value={securityStats.botDetections} />
        <StatCard title="Brute Force Attempts" value={securityStats.bruteForceAttempts} />
      </div>
      
      <ThreatTimeline data={dashboardData?.events} />
      <TopThreatsList threats={dashboardData?.topThreats} />
    </div>
  );
}
```

### **B. Automated Alerts**
```javascript
// Email/SMS сповіщення
const alertConfig = {
  email: {
    enabled: true,
    recipients: ['admin@example.com', 'security@example.com'],
    templates: {
      highRisk: 'High risk activity detected: {details}',
      bruteForce: 'Brute force attack detected from IP: {ip}',
      botDetected: 'Bot activity detected: {suspicionScore}'
    }
  },
  slack: {
    enabled: true,
    webhook: 'https://hooks.slack.com/services/...',
    channel: '#security-alerts'
  },
  sms: {
    enabled: false, // Тільки для критичних подій
    threshold: 0.95
  }
};
```

---

## 🎯 **Рекомендації по оптимізації**

### **1. Performance Optimization**

#### **A. Caching Strategy**
```javascript
// Redis кешування для rate limiting
const redisConfig = {
  host: 'localhost',
  port: 6379,
  db: 0,
  keyPrefix: 'security:',
  ttl: {
    rateLimit: 15 * 60, // 15 хвилин
    bruteForce: 60 * 60, // 1 година
    botDetection: 30 * 60 // 30 хвилин
  }
};
```

#### **B. Database Optimization**
```sql
-- Індекси для швидкого пошуку
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_type ON security_events(event_type);

-- Партиціонування за датами
CREATE TABLE security_events_2024_01 PARTITION OF security_events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### **2. Scalability**

#### **A. Load Balancing**
```javascript
// Nginx конфігурація для rate limiting
http {
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
  
  server {
    location /api/ {
      limit_req zone=api burst=20 nodelay;
      proxy_pass http://backend;
    }
    
    location /api/auth/ {
      limit_req zone=auth burst=5 nodelay;
      proxy_pass http://backend;
    }
  }
}
```

#### **B. Microservices Architecture**
```javascript
// Окремий сервіс для безпеки
const securityService = {
  port: 3001,
  endpoints: {
    '/check-rate-limit': rateLimitChecker,
    '/detect-bot': botDetector,
    '/log-event': eventLogger,
    '/get-stats': statsProvider
  }
};
```

---

## 🔒 **Додаткові заходи безпеки**

### **1. Network Security**
```javascript
// Cloudflare інтеграція
const cloudflareConfig = {
  apiKey: process.env.CLOUDFLARE_API_KEY,
  zoneId: process.env.CLOUDFLARE_ZONE_ID,
  rules: {
    challengeCaptcha: 'cf.challenge_score < 30',
    blockTor: 'cf.threat_score > 14',
    rateLimit: 'cf.rate_limit_score > 100'
  }
};
```

### **2. DDoS Protection**
```javascript
// AWS Shield + CloudFront
const awsConfig = {
  shield: {
    enabled: true,
    autoScaling: true,
    customRules: [
      {
        name: 'High Request Rate',
        condition: 'rate > 1000/minute',
        action: 'challenge'
      }
    ]
  },
  cloudfront: {
    rateLimiting: {
      requestsPerSecond: 100,
      burstSize: 200
    }
  }
};
```

### **3. Advanced Bot Protection**
```javascript
// Google reCAPTCHA v3 інтеграція
const recaptchaConfig = {
  siteKey: process.env.RECAPTCHA_SITE_KEY,
  secretKey: process.env.RECAPTCHA_SECRET_KEY,
  threshold: 0.5,
  action: 'submit_form'
};

const verifyRecaptcha = async (token, action) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${recaptchaConfig.secretKey}&response=${token}`
  });
  
  const data = await response.json();
  return data.score >= recaptchaConfig.threshold && data.action === action;
};
```

---

## 📈 **Метрики та KPI**

### **Ключові показники ефективності:**

1. **Security Score**: 95%+ (з 100%)
2. **False Positive Rate**: < 2%
3. **Attack Detection Time**: < 5 секунд
4. **Response Time Impact**: < 50ms додаткової затримки
5. **Uptime**: 99.9%+ доступність
6. **Blocked Requests**: 90%+ підозрілих запитів

### **Моніторинг метрик:**
```javascript
const metricsConfig = {
  prometheus: {
    enabled: true,
    port: 9090,
    metrics: [
      'security_requests_total',
      'security_blocks_total',
      'security_bot_detections_total',
      'security_response_time_seconds'
    ]
  },
  grafana: {
    dashboard: 'security-dashboard',
    alerts: [
      'High Block Rate',
      'Bot Detection Spike',
      'Response Time Increase'
    ]
  }
};
```

---

## 🚨 **План реагування на інциденти**

### **1. Автоматичні дії:**
- Блокування IP при високому рівні ризику
- Активація CAPTCHA при підозрілій активності
- Збільшення rate limits при DDoS атаці

### **2. Ручне реагування:**
- Аналіз логів безпеки
- Оновлення правил захисту
- Повідомлення команди безпеки

### **3. Відновлення:**
- Автоматичне розблокування через час
- Ручне розблокування для помилкових спрацьовувань
- Оновлення системи захисту

---

**Ця система забезпечує комплексний захист від основних загроз з мінімальним впливом на продуктивність!** 🛡️✨
