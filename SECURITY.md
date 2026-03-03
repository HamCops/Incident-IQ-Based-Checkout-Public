# Security Policy

## Supported Versions

This project is actively maintained. Only the latest version receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in this project, please report it responsibly:

### How to Report

1. **Email**: Send details to the repository maintainer (check GitHub profile)
2. **Expected Response Time**: You should receive an acknowledgment within 48 hours
3. **Follow-up**: If you don't receive a response, please follow up to ensure we received your report

### What to Include

Please provide as much information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass, etc.)
- **Full paths** of affected source files
- **Location** of the affected code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if available)
- **Impact assessment** - What could an attacker achieve?
- **Suggested fix** (if you have one)

### Disclosure Policy

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a detailed response within 5 business days
- We will work to verify and reproduce the issue
- We will develop and test a fix
- We will release a security update
- We will publicly disclose the vulnerability after a fix is available

## Security Best Practices for Deployment

When deploying this system in your environment:

### 1. **API Security**

```javascript
✅ DO:
- Store API tokens in Google Apps Script PropertiesService
- Rotate API tokens every 90 days
- Use different tokens for dev/staging/production
- Monitor IncidentIQ API logs for suspicious activity
- Set API_TIMEOUT_MS to prevent hanging requests

❌ DON'T:
- Never hardcode API tokens in code files
- Never commit tokens to version control
- Never share tokens in emails or chat
- Never use production tokens in development
```

### 2. **Google Sheets Security**

```javascript
✅ DO:
- Restrict spreadsheet access to authorized users only
- Use Google Workspace organization-only sharing
- Enable view-only access for most users
- Limit edit access to IT administrators
- Enable version history and audit logs

❌ DON'T:
- Never make the spreadsheet publicly accessible
- Never share the spreadsheet URL in public forums
- Never disable access controls
```

### 3. **Web App Deployment**

```javascript
✅ DO:
- Deploy with "Execute as: Me"
- Set "Who has access" to your organization only
- Use versioned deployments (not @dev)
- Keep deployment URLs confidential
- Review Apps Script permissions carefully

❌ DON'T:
- Never deploy with "Who has access: Anyone"
- Never share deployment URLs publicly
- Never grant unnecessary OAuth scopes
```

### 4. **Data Protection**

```javascript
✅ DO:
- Enable FERPA-compliant PII redaction (already implemented)
- Use rate limiting (configured in Config.gs)
- Validate all user inputs (already implemented)
- Sanitize data before logging (already implemented)
- Regularly backup Google Sheets data

❌ DON'T:
- Never log full student records
- Never expose sensitive data in error messages
- Never disable input validation
- Never trust client-side validation alone
```

### 5. **Configuration Security**

```javascript
✅ DO:
- Review all TODO comments in Config.gs
- Use unique, complex values for all GUIDs
- Update email domains in Validators.gs
- Configure appropriate rate limits
- Enable all security features

❌ DON'T:
- Never use default/example configuration in production
- Never commit .env files
- Never share configuration files publicly
```

## Built-in Security Features

This application includes multiple layers of security:

### Input Validation & Sanitization
- ✅ **Email validation** - 15+ attack pattern detection (CRLF, XSS, SQLi, etc.)
- ✅ **Asset tag validation** - Format enforcement and sanitization
- ✅ **Input sanitization** - Removes dangerous characters and event handlers
- ✅ **HTML encoding** - Prevents XSS attacks in display

### Rate Limiting
- ✅ **Per-user limits** - Configurable requests per minute (default: 10)
- ✅ **Automatic lockout** - Temporary ban for violations (default: 15 minutes)
- ✅ **ScriptCache storage** - Prevents anonymous bypass attempts
- ✅ **Sliding window** - Accurate rate tracking over time

### API Security
- ✅ **Token storage** - Secure PropertiesService (not hardcoded)
- ✅ **Timeout protection** - 30-second default timeout
- ✅ **Retry logic** - Exponential backoff for failed requests
- ✅ **Error handling** - Safe error messages without data leakage

### PII Protection
- ✅ **FERPA compliance** - Email masking in security logs
- ✅ **Safe logging** - PII redaction in all log outputs
- ✅ **Minimal exposure** - Only log necessary information
- ✅ **Audit trails** - Track access without exposing sensitive data

### Transaction Safety
- ✅ **Automatic rollback** - Reverts IncidentIQ changes on Sheet failures
- ✅ **Consistency checks** - Validates state before committing
- ✅ **Error recovery** - Graceful handling of partial failures
- ✅ **IT notifications** - Alerts on critical transaction failures

### Frontend Security
- ✅ **Content Security Policy** - Restricts inline scripts and resources
- ✅ **Input validation** - Client and server-side validation
- ✅ **HTTPS only** - Enforced for all deployments
- ✅ **No inline handlers** - Prevents event handler injection

## Configuration Checklist

Before deploying, ensure you've configured:

```bash
☐ Updated getIncidentIQConfig() with your domain, IDs, and GUIDs
☐ Set up API token in PropertiesService (never in code)
☐ Updated NOTIFICATION_CONFIG.IT_STAFF_EMAILS
☐ Updated CHARGE_SHEET_CONFIG.EMAIL_RECIPIENTS
☐ Updated CHARGE_SHEET_CONFIG.SCHOOL_CONTACT
☐ Updated email domain in Validators.gs (@yourschool.org)
☐ Created Google Docs template and set TEMPLATE_ID
☐ Configured time triggers for automated functions
☐ Reviewed and adjusted rate limiting settings
☐ Tested with sample data before production use
☐ Set up monitoring for error notifications
```

## Known Limitations

Be aware of these platform limitations:

- **Google Apps Script quotas**: Max 6 minutes execution time, 30 MB response size
- **Rate limiting**: Enforced by both this app and IncidentIQ
- **Email limits**: Gmail has daily sending limits (500 emails/day for Workspace)
- **Cache limits**: ScriptCache limited to 100KB per key, 1GB total
- **Concurrent users**: May experience delays with high simultaneous usage

## Regular Security Maintenance

### Monthly Tasks
- [ ] Review access logs in Google Sheets
- [ ] Check for Dependabot alerts (if using GitHub)
- [ ] Review Apps Script execution logs for errors
- [ ] Verify all automated triggers are running correctly

### Quarterly Tasks
- [ ] Rotate IncidentIQ API token
- [ ] Review and update user permissions
- [ ] Audit checkout/return logs for anomalies
- [ ] Test disaster recovery procedures

### Annual Tasks
- [ ] Comprehensive security audit
- [ ] Review and update configuration
- [ ] Update documentation
- [ ] Test all security features
- [ ] Review compliance with school policies

## Compliance Considerations

This system handles student data and must comply with:

- **FERPA** (Family Educational Rights and Privacy Act)
- **State data privacy laws**
- **School district policies**
- **Google Workspace terms of service**
- **IncidentIQ terms of service**

Consult with your school's legal and IT departments before deployment.

## Security Updates

Security updates will be released as soon as possible after verification. Subscribe to repository notifications to receive security alerts.

### How We Handle Security Issues

1. **Assessment** - Verify severity and impact
2. **Development** - Create and test fix
3. **Testing** - Comprehensive security testing
4. **Release** - Deploy fix with security advisory
5. **Disclosure** - Public disclosure after fix is available

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Apps Script Security Best Practices](https://developers.google.com/apps-script/guides/security)
- [IncidentIQ Security Documentation](https://support.incidentiq.com/)
- [FERPA Compliance Guidelines](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html)

## Questions?

If you have security questions or concerns that aren't sensitive vulnerabilities, please open a GitHub Discussion or Issue.

---

**Last Updated**: January 2026
**Version**: 2.0
