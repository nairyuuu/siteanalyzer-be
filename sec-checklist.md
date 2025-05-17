# Security Checklist

## 1. Password Security
- [x] Enforce a strong password policy:
  - Minimum length of 8 characters.
  - Require uppercase, lowercase, numbers, and special characters.
- [x] Use `bcrypt` for secure password hashing with a sufficient work factor (e.g., 12).
- [x] Implement account lockout after multiple failed login attempts.
- [ ] Add CAPTCHA to prevent automated brute-force attacks.
- [x] Use secure, time-limited password reset tokens for password recovery.

## 2. Access Token Security
- [x] Use signed JWTs with a strong secret key.
- [x] Validate tokens on every request.
- [x] Set short expiration times for access tokens and use refresh tokens for long-lived sessions.
- [ ] Implement CSRF protection using anti-CSRF tokens and `SameSite` cookies.
- [ ] Use secure cookies (`HttpOnly`, `Secure`, `SameSite`) to prevent session hijacking.

## 3. Access Control
- [ ] Implement Role-Based Access Control (RBAC) for user roles (e.g., admin, user).
- [ ] Restrict access to sensitive routes based on roles.
- [ ] Enforce strict policies for sensitive resources (Mandatory Access Control - MAC).

## 4. Input Validation and Sanitization
- [ ] Validate all user inputs against expected formats.
- [ ] Sanitize inputs to remove or escape harmful characters.
- [ ] Use parameterized queries to prevent noSQL injection.
- [ ] Validate and sanitize file paths to prevent path traversal attacks.
- [ ] Restrict file uploads by type, size, and location.

## 5. Minimization of Sensitive Information Leakage
- [ ] Disable server banners and version information in HTTP headers.
- [ ] Avoid exposing stack traces or detailed error messages in responses.

## 6. Network Security
- [x] Enforce HTTPS for all communication. We config nginx to enforce https
- [x] Redirect HTTP traffic to HTTPS. Configuring nginx
- [x] Implement rate limiting and request throttling to mitigate DoS attacks. rateLimiting in server.js
- [x] Store sensitive values (e.g., API keys, database credentials) in environment variables or a secrets management tool. The sensitive value is stored in .env file, for CI/CD, the credentials (ssh-key, ssh-user) is stored in github built-in credentials storing tools

## 7. Code and Application Security
- [x] Perform source code reviews using automated tools like SonarQube. Used SonarQube got A in Security, Reliability, Maintainability
- [ ] Conduct basic penetration testing using tools like ZAP Proxy, RAF DAS, or Nikto.

## 8. Advanced Security Measures
- [ ] Implement Multi-Factor Authentication (MFA) for sensitive operations or privileged accounts.
- [ ] Detect and prevent session hijacking by monitoring access from unfamiliar devices, browsers, or IPs.
- [ ] Use advanced HTTP flood prevention mechanisms like Web Application Firewalls (WAFs).

## 9. Deployment Security
- [ ] Use Docker health checks to ensure services are running properly.
- [ ] Restrict access to Docker containers and networks.
- [ ] Secure the database by requiring authentication and restricting access to trusted IPs.

## 10. Logging and Monitoring
- [x] Enable logging for all critical actions and errors.
- [x] Monitor logs for suspicious activity.
- [ ] Set up alerts for potential security breaches.

## 11. Regular Updates and Patching
- [ ] Keep all dependencies and libraries up to date.
- [ ] Regularly patch known vulnerabilities in the application and server.

## 12. Backup and Recovery
- [ ] Regularly back up the database and application data.
- [ ] Test recovery procedures to ensure backups are functional.