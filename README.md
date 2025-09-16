# FixerUpper - E-commerce Platform

## Table of Contents

1. [Project Overview](#project-overview)
2. [Purpose](#purpose)
3. [Getting Started](#getting-started)
4. [Functionality](#functionality)
5. [Security](#security)
6. [Use Cases](#use-cases)
7. [Testing Security](#testing-security)

## Project Overview

FixerUpper is a modern, secure e-commerce platform built with React and Redux. It provides a comprehensive online shopping experience with robust security measures to protect both users and the platform from various cyber threats.

## Purpose

This project serves as a demonstration of modern web development practices with a strong emphasis on security. It showcases:

- Modern React development with hooks and functional components
- Redux state management for complex application state
- Comprehensive security implementations
- Best practices for input validation and sanitization
- Protection against common web vulnerabilities
- Performance optimization techniques

The platform is designed for educational and demonstration purposes, showing how to build secure web applications that can withstand various types of cyber attacks.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Git

### Installation and Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fixerUpper-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your code editor**
   - Recommended: VS Code with React extensions
   - The project will be available at `http://localhost:5180`

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Run tests**
   ```bash
   npm test
   ```

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── redux/              # State management
├── utils/              # Utility functions
│   ├── security/       # Security implementations
│   └── validation/     # Input validation
├── hooks/              # Custom React hooks
├── api/                # API service functions
└── css/                # Global styles
```

## Functionality

### Core Features

- **User Authentication**: Registration, login, logout with secure session management
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add/remove items, quantity management
- **Order Management**: Place orders, view order history, order details
- **Admin Panel**: Product management, order tracking, user management
- **Responsive Design**: Mobile-first approach with modern UI/UX

### Technical Features

- **State Management**: Redux Toolkit for centralized state management
- **Routing**: React Router for client-side navigation
- **Form Handling**: Formik with Joi validation
- **Animations**: Framer Motion for smooth user interactions
- **Performance**: Lazy loading, code splitting, optimization
- **Security**: Comprehensive protection against web vulnerabilities

## Security

This project implements multiple layers of security protection against various cyber threats. Each security measure is documented with its purpose, implementation, and testing procedures.

### SQL Injection Protection

**Threat Description**: SQL injection attacks occur when malicious SQL code is inserted into input fields, allowing attackers to manipulate databases and access sensitive information.

**Potential Impact**: 
- Unauthorized access to user data
- Database corruption or deletion
- Privilege escalation
- Data breach and privacy violations

**Implemented Protection**:
- Input sanitization and validation
- Parameterized queries simulation
- SQL keyword detection
- Special character filtering
- Pattern-based threat detection

**Testing Procedures**:
1. Attempt to inject SQL commands in login forms
2. Test with malicious input in search fields
3. Try to bypass validation with encoded characters
4. Test with various SQL injection payloads

**Files**: `src/utils/security/sqlProtection/`

### Cross-Site Scripting (XSS) Protection

**Threat Description**: XSS attacks inject malicious scripts into web pages, which execute in users' browsers and can steal sensitive information or perform unauthorized actions.

**Potential Impact**:
- Session hijacking
- Cookie theft
- Malicious redirects
- Keylogger installation
- Phishing attacks

**Implemented Protection**:
- HTML entity encoding
- Content Security Policy (CSP)
- Input sanitization
- Output encoding
- Safe HTML rendering

**Testing Procedures**:
1. Inject script tags in input fields
2. Test with JavaScript event handlers
3. Attempt to execute malicious code
4. Test with various XSS payloads

**Files**: `src/utils/security/sanitizeHtml.js`, `src/components/SafeHTML/`

### Cross-Site Request Forgery (CSRF) Protection

**Threat Description**: CSRF attacks trick users into performing unwanted actions on web applications where they are authenticated.

**Potential Impact**:
- Unauthorized transactions
- Account modifications
- Data deletion
- Privilege changes

**Implemented Protection**:
- CSRF tokens
- SameSite cookie attributes
- Origin verification
- Double-submit cookies
- Referer header validation

**Testing Procedures**:
1. Create malicious forms targeting authenticated users
2. Test cross-origin requests
3. Attempt to bypass CSRF protection
4. Test with various CSRF attack vectors

**Files**: `src/api/csrfService.js`

### Clickjacking Protection

**Threat Description**: Clickjacking attacks trick users into clicking on hidden or disguised elements by overlaying malicious content.

**Potential Impact**:
- Unauthorized clicks
- Data theft
- Account takeover
- Malicious downloads

**Implemented Protection**:
- X-Frame-Options headers
- Content Security Policy frame-ancestors
- JavaScript frame busting
- Trusted domain whitelisting
- Suspicious pattern detection

**Testing Procedures**:
1. Attempt to embed pages in iframes
2. Test frame busting mechanisms
3. Try to overlay malicious content
4. Test with various clickjacking techniques

**Files**: `src/utils/security/webSecurity/clickjackingProtection/`

### Upload Attack Protection

**Threat Description**: Upload attacks involve uploading malicious files that can execute code, contain malware, or exploit server vulnerabilities.

**Potential Impact**:
- Server compromise
- Malware distribution
- Code execution
- Storage exhaustion
- Data corruption

**Implemented Protection**:
- File type validation
- MIME type verification
- File size limits
- Magic number checking
- Content scanning
- Upload rate limiting
- Quarantine system

**Testing Procedures**:
1. Attempt to upload executable files
2. Test with files containing malicious code
3. Try to bypass file type restrictions
4. Test with oversized files

**Files**: `src/utils/security/webSecurity/uploadProtection/`

### Open Redirect Protection

**Threat Description**: Open redirect vulnerabilities allow attackers to redirect users to malicious websites while appearing to come from the legitimate site.

**Potential Impact**:
- Phishing attacks
- Malware distribution
- Credential theft
- Brand reputation damage

**Implemented Protection**:
- URL validation and whitelisting
- Domain verification
- Suspicious pattern detection
- Encoding attack prevention
- Redirect history tracking

**Testing Procedures**:
1. Attempt to redirect to external malicious sites
2. Test with encoded URLs
3. Try to bypass domain restrictions
4. Test with various redirect techniques

**Files**: `src/utils/security/webSecurity/redirectProtection/`

### Rate Limiting and DDoS Protection

**Threat Description**: DDoS attacks overwhelm servers with excessive requests, causing service disruption and potential system crashes.

**Potential Impact**:
- Service unavailability
- Performance degradation
- Resource exhaustion
- Business disruption

**Implemented Protection**:
- Request rate limiting
- IP-based throttling
- Sliding window algorithms
- Progressive delays
- Automatic blocking

**Testing Procedures**:
1. Send excessive requests to endpoints
2. Test rate limiting mechanisms
3. Attempt to bypass restrictions
4. Test with various DDoS techniques

**Files**: `src/utils/security/rateLimiting/rateLimiter.js`

### Brute Force Protection

**Threat Description**: Brute force attacks attempt to gain unauthorized access by systematically trying different username/password combinations.

**Potential Impact**:
- Account compromise
- Unauthorized access
- Data breach
- System takeover

**Implemented Protection**:
- Login attempt limiting
- Progressive delays
- Account lockout mechanisms
- Suspicious activity detection
- IP-based blocking

**Testing Procedures**:
1. Attempt multiple failed login attempts
2. Test progressive delay mechanisms
3. Try to bypass attempt limits
4. Test with various brute force techniques

**Files**: `src/utils/security/rateLimiting/bruteForceProtection.js`

### Bot Detection

**Threat Description**: Bot attacks use automated scripts to perform malicious activities like scraping, spamming, or conducting attacks at scale.

**Potential Impact**:
- Resource exhaustion
- Data scraping
- Spam generation
- Automated attacks
- Performance degradation

**Implemented Protection**:
- User agent analysis
- Behavioral pattern detection
- CAPTCHA challenges
- Fingerprinting techniques
- Request pattern analysis

**Testing Procedures**:
1. Test with automated tools and scripts
2. Attempt to bypass bot detection
3. Test behavioral analysis
4. Try various bot simulation techniques

**Files**: `src/utils/security/rateLimiting/botDetection/`

### Security Headers

**Threat Description**: Missing or misconfigured security headers can expose applications to various attacks and vulnerabilities.

**Potential Impact**:
- XSS vulnerabilities
- Clickjacking attacks
- MIME type confusion
- Information disclosure

**Implemented Protection**:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy

**Testing Procedures**:
1. Check HTTP response headers
2. Test CSP violations
3. Verify header configurations
4. Test with security header scanners

**Files**: `src/utils/security/rateLimiting/securityHeaders.js`

### Input Validation and Sanitization

**Threat Description**: Insufficient input validation allows malicious data to enter the application, leading to various security vulnerabilities.

**Potential Impact**:
- Code injection
- Data corruption
- Logic bypass
- Information disclosure

**Implemented Protection**:
- Joi schema validation
- Input sanitization
- Type checking
- Length validation
- Pattern matching

**Testing Procedures**:
1. Test with invalid input types
2. Attempt to bypass validation
3. Test with malicious patterns
4. Verify sanitization effectiveness

**Files**: `src/utils/validation/`, `src/utils/security/sanitize*.js`

## Use Cases

### User Authentication Flow
```
User Registration → Input Validation → Sanitization → Database Storage → Session Creation
```

### Product Management Flow
```
Admin Login → Product Creation → File Upload Validation → Security Checks → Database Storage
```

### Order Processing Flow
```
User Login → Cart Management → Order Placement → Payment Processing → Order Confirmation
```

### Security Monitoring Flow
```
Request Reception → Security Checks → Threat Detection → Response Generation → Logging
```

## Testing Security

### Manual Testing

1. **SQL Injection Testing**
   - Use tools like SQLMap or manual payload injection
   - Test all input fields with malicious SQL code
   - Verify database remains secure

2. **XSS Testing**
   - Inject script tags in all input fields
   - Test with various XSS payloads
   - Verify output encoding

3. **CSRF Testing**
   - Create malicious forms targeting authenticated users
   - Test cross-origin requests
   - Verify CSRF token validation

4. **Upload Security Testing**
   - Attempt to upload executable files
   - Test with malicious file content
   - Verify quarantine mechanisms

### Automated Testing

1. **Run Security Tests**
   ```bash
   npm test
   ```

2. **Security Linting**
   ```bash
   npm run lint
   ```

3. **Dependency Vulnerability Scan**
   ```bash
   npm audit
   ```

### Security Monitoring

The application includes comprehensive logging and monitoring for:
- Failed authentication attempts
- Suspicious request patterns
- Security violations
- Performance metrics
- Error tracking

### Best Practices

1. **Regular Updates**: Keep dependencies updated
2. **Security Audits**: Regular security assessments
3. **Monitoring**: Continuous security monitoring
4. **Training**: Security awareness training
5. **Documentation**: Maintain security documentation

---

This README provides a comprehensive overview of the FixerUpper project, its security implementations, and testing procedures. For detailed implementation code, refer to the respective files in the `src/utils/security/` directory.