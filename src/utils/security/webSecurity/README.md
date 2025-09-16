# Web Security Module

Comprehensive protection against web-based attacks including clickjacking, upload attacks, and open redirects.

## 🛡️ Protection Features

### 1. Clickjacking Protection (`clickjackingProtection.js`)
- **X-Frame-Options headers** - Prevents pages from being embedded in frames
- **CSP frame-ancestors** - Content Security Policy for frame control
- **JavaScript frame busting** - Client-side protection against iframe embedding
- **Suspicious pattern detection** - Detects clickjacking attempts
- **Trusted domain management** - Whitelist trusted domains for embedding

### 2. Upload Attack Protection (`uploadProtection.js`)
- **File type validation** - Restricts allowed file types and extensions
- **MIME type verification** - Validates file MIME types
- **File size limits** - Prevents oversized file uploads
- **Magic number checking** - Verifies file headers match declared types
- **Content scanning** - Scans file content for malicious patterns
- **Upload rate limiting** - Limits uploads per user per time period
- **Quarantine system** - Isolates suspicious files for review

### 3. Open Redirect Protection (`redirectProtection.js`)
- **URL validation** - Validates redirect URLs for safety
- **Domain whitelisting** - Only allows redirects to trusted domains
- **Suspicious pattern detection** - Detects malicious redirect patterns
- **Encoding attack prevention** - Prevents URL encoding bypasses
- **Redirect history tracking** - Monitors for redirect loops and abuse
- **Safe redirect generation** - Creates safe redirect URLs

## 🚀 Usage

### Basic Setup

```javascript
import { WebSecurityManager } from './utils/security/webSecurity/index.js';

const securityManager = new WebSecurityManager({
  enableClickjackingProtection: true,
  enableUploadProtection: true,
  enableRedirectProtection: true,
  strictMode: false
});
```

### React Hook Usage

```javascript
import { useWebSecurity } from './hooks/useWebSecurity.js';

function MyComponent() {
  const {
    validateFileUpload,
    validateRedirect,
    checkClickjacking,
    securityStats
  } = useWebSecurity();

  // Validate file upload
  const handleFileUpload = async (file) => {
    const result = await validateFileUpload(file, 'user123');
    if (!result.isValid) {
      console.error('Upload blocked:', result.errors);
    }
  };

  // Validate redirect
  const handleRedirect = (url) => {
    const result = validateRedirect(url, 'user123');
    if (result.isValid) {
      window.location.href = result.safeUrl;
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      <button onClick={() => handleRedirect('/external-site')}>
        Redirect
      </button>
    </div>
  );
}
```

## ⚙️ Configuration Options

### Clickjacking Protection
```javascript
const clickjackingOptions = {
  enableXFrameOptions: true,
  enableCSPFrameAncestors: true,
  allowSameOrigin: false,
  trustedDomains: ['trusted-site.com', '*.trusted-domain.com'],
  enableJavaScriptProtection: true
};
```

### Upload Protection
```javascript
const uploadOptions = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  allowedExtensions: ['.jpg', '.png', '.pdf'],
  scanForMalware: true,
  quarantineSuspicious: true,
  maxFilesPerHour: 50,
  maxFilesPerDay: 200
};
```

### Redirect Protection
```javascript
const redirectOptions = {
  allowedDomains: ['trusted-site.com', 'partner.com'],
  allowSameOrigin: true,
  allowRelativePaths: true,
  strictMode: false,
  maxRedirectDepth: 5
};
```

## 🔍 Security Features

### File Upload Security
- **Executable file blocking** - Prevents upload of executable files
- **Double extension detection** - Detects files with suspicious double extensions
- **Content analysis** - Scans file content for malicious patterns
- **Magic number validation** - Verifies file headers match declared types
- **Rate limiting** - Prevents upload abuse

### Clickjacking Prevention
- **Frame embedding prevention** - Blocks unauthorized iframe embedding
- **JavaScript protection** - Client-side frame busting code
- **Header-based protection** - Uses HTTP headers for server-side protection
- **Suspicious pattern detection** - Identifies clickjacking attempts

### Open Redirect Protection
- **Domain whitelisting** - Only allows redirects to trusted domains
- **URL encoding attack prevention** - Detects and blocks encoding bypasses
- **Redirect loop detection** - Prevents infinite redirect loops
- **Suspicious pattern blocking** - Blocks malicious redirect patterns

## 📊 Monitoring and Statistics

```javascript
// Get security statistics
const stats = securityManager.getStats();

console.log('Security Stats:', {
  totalEvents: stats.totalEvents,
  blockedEvents: stats.blockedEvents,
  riskLevels: stats.riskLevels,
  blockTypes: stats.blockTypes
});
```

## 🛠️ Integration Examples

### Express.js Middleware
```javascript
app.use((req, res, next) => {
  const securityCheck = securityManager.processSecurityCheck(req.body, req.ip);
  
  if (!securityCheck.allowed) {
    return res.status(403).json({ error: 'Request blocked' });
  }
  
  // Add security headers
  Object.entries(securityCheck.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  next();
});
```

### File Upload Handler
```javascript
app.post('/upload', async (req, res) => {
  const file = req.file;
  const validation = await securityManager.uploadProtection.validateFileUpload(file, req.ip);
  
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  // Process file
  res.json({ success: true });
});
```

## 🔧 Best Practices

1. **Enable all protections** - Use clickjacking, upload, and redirect protection together
2. **Configure trusted domains** - Whitelist only necessary domains for redirects
3. **Set appropriate file limits** - Configure file size and type limits based on your needs
4. **Monitor security events** - Regularly check security statistics and blocked requests
5. **Use strict mode** - Enable strict mode for production environments
6. **Regular updates** - Keep security patterns and rules updated

## 🚨 Security Considerations

- **File uploads** - Always validate files on both client and server side
- **Redirect URLs** - Never trust user-provided redirect URLs without validation
- **Frame embedding** - Use appropriate frame policies for your application
- **Content scanning** - Regularly scan uploaded files for malware
- **Rate limiting** - Implement appropriate rate limits for all operations

## 📝 License

This module is part of the fixerUpper security system and follows the same licensing terms.
