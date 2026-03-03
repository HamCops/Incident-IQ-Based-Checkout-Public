# Chromebook & Device Checkout System

A production-ready Google Apps Script solution for managing Chromebook and device checkouts with real-time IncidentIQ integration. Originally developed for educational institutions, this system provides automated inventory management, comprehensive security features, and seamless integration between Google Sheets and IncidentIQ.

## ✨ Key Features

- **Real-time IncidentIQ Integration** - Automatic device assignment/unassignment via IncidentIQ API
- **Multi-level Caching System** - 361x performance improvement (2min → 15min → API) with race condition protection
- **Unlimited User Search** - Finds all users regardless of database size with fuzzy email matching
- **Transaction Safety** - Automatic rollback on failures to maintain data integrity
- **Comprehensive Security**
  - Rate limiting (configurable requests per minute)
  - Email injection protection (15+ attack patterns blocked)
  - FERPA-compliant PII redaction in logs
  - Secure API token storage via PropertiesService
  - Single-device checkout limits (configurable)
  - 30-second API timeout protection
- **Automated Notifications**
  - Daily overnight device retention alerts
  - Automatic charge sheet generation for overdue devices (3+ days)
  - Customizable email templates and schedules
- **Modern Web Interface**
  - Real-time autocomplete for asset tags
  - Instant verification before submission
  - Responsive design for desktop and mobile
- **Hybrid Storage System** - Active checkouts + monthly archive sheets (30x performance improvement)

## ⚠️ Security Notice

**This is a self-hosted application that handles sensitive student and device data.**

### Before Deploying to Production

1. **Review the [Security Policy](SECURITY.md)** - Comprehensive security guidelines and best practices
2. **Never commit credentials** - Use Google Apps Script PropertiesService for API tokens (see [Setup Instructions](#step-5-secure-api-token-setup))
3. **Configure all security settings** - Review every TODO comment in `src/utils/Config.gs`
4. **Restrict access** - Deploy web app with "Execute as: Me" and organization-only access
5. **Enable monitoring** - Set up email alerts for errors and security events
6. **Regular maintenance** - Rotate API tokens every 90 days, review access logs monthly

### Security Compliance

This system is designed with **FERPA compliance** in mind and includes:

- ✅ Rate limiting and brute-force protection
- ✅ Input validation and sanitization (15+ attack patterns blocked)
- ✅ PII redaction in all logs
- ✅ Secure API token storage
- ✅ Transaction rollback on failures
- ✅ Comprehensive audit trails

**For production use**: Consult with your school's legal, IT, and security teams to ensure compliance with all applicable regulations and policies.

### Quick Security Checklist

```bash
☐ Read SECURITY.md completely
☐ Never commit .env or credentials files
☐ Use PropertiesService for API token storage
☐ Update email domain in Validators.gs
☐ Configure rate limiting appropriately
☐ Restrict Google Sheet access to authorized users only
☐ Deploy web app with organization-only access
☐ Enable all security features in Config.gs
☐ Set up automated backups
☐ Configure error monitoring and alerts
☐ Review and test with sample data first
☐ Document your deployment configuration
```

## 🏗️ Architecture

### Modular Service Layer Pattern

```
frontend/Form.html (Web Interface)
    ↓
Main.gs (Entry Point & Orchestration)
    ↓
┌─────────────────────────────────────┐
│   Service Layer                     │
│  ├─ IncidentIQService.gs            │
│  ├─ CacheManager.gs                 │
│  ├─ ChargeSheetService.gs           │
│  └─ ChargeSheetEmail.gs             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Repository Layer                  │
│  ├─ CheckoutRepository.gs           │
│  └─ ChargeSheetRepository.gs        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   External Systems                  │
│  ├─ Google Sheets (Data storage)    │
│  ├─ IncidentIQ API (Device mgmt)    │
│  └─ Gmail (Email notifications)     │
└─────────────────────────────────────┘
```

**Utilities & Security:**
- `Config.gs` - Centralized configuration
- `Validators.gs` - Input validation & sanitization
- `Utilities.gs` - Helper functions
- `Security.gs` - Rate limiting, PII redaction, secure logging
- `Testing.gs` - Comprehensive test suite (13+ tests)

## 📋 Prerequisites

- **Google Workspace Account** with permissions to:
  - Create and deploy Apps Script web apps
  - Create and manage Google Sheets
  - Send emails via Gmail
- **IncidentIQ Account** with:
  - Administrator access to generate API tokens
  - Site ID and Asset View configured
  - API access enabled
- **Basic Knowledge**:
  - Google Apps Script
  - REST APIs
  - Google Sheets

## 🚀 Installation & Setup

### Step 1: Create Google Sheets Structure

1. Create a new Google Spreadsheet
2. Create the following sheets with these exact names:
   - **Active Checkouts** - Current device checkouts
   - **Overdue Alerts** - Dashboard for overdue devices
   - **Charge Sheet Tracking** - Track generated charge sheets
   - **Archive-YYYY-MM** - Monthly archive sheets (created automatically)

### Step 2: Get IncidentIQ Credentials

1. Log into IncidentIQ as an administrator
2. Navigate to: **Administration → Developer Tools**
3. Generate a new API token (JWT format)
4. Note down your:
   - **API Token** (JWT string)
   - **Site ID** (GUID format, found in JWT claims or IncidentIQ settings)
   - **Asset View ID** (GUID format, create a view with devices you want available for checkout)
   - **Domain** (e.g., yourschool.incidentiq.com)

### Step 3: Deploy the Apps Script Project

1. Create a new Google Apps Script project
2. Copy all `.gs` files to your Apps Script project:
   - `Main.gs`
   - All files from `src/services/`
   - All files from `src/repositories/`
   - All files from `src/utils/`
   - All files from `src/security/`
3. Copy `frontend/Form.html` to your project
4. The project should maintain the modular structure (order doesn't matter in Apps Script)

### Step 4: Configure the System

Edit `src/utils/Config.gs` and update the following:

```javascript
// In getIncidentIQConfig() function:
return {
  domain: 'YOUR_SCHOOL.incidentiq.com',          // Your IncidentIQ domain
  apiToken: apiToken,                             // Retrieved from PropertiesService
  baseUrl: 'https://YOUR_SCHOOL.incidentiq.com/api/v1.0',
  siteId: 'YOUR_SITE_ID_GUID',                   // Your IncidentIQ Site ID
  assetViewId: 'YOUR_ASSET_VIEW_ID_GUID',        // Your IncidentIQ Asset View ID
  spreadsheetId: 'YOUR_SPREADSHEET_ID'           // Your Google Sheet ID
};

// Update notification emails:
var NOTIFICATION_CONFIG = {
  IT_STAFF_EMAILS: [
    'admin@example.com',                          // Replace with your IT staff emails
    'tech@example.com'
  ],
  EMAIL_FROM_NAME: 'Your School IT Department',  // Customize sender name
  SCHOOL_TIMEZONE: 'America/New_York',           // Your timezone
  // ... other settings
};

// Update charge sheet configuration:
var CHARGE_SHEET_CONFIG = {
  EMAIL_RECIPIENTS: [
    'admin@example.com',                          // Replace with notification recipients
    'billing@example.com'
  ],
  TEMPLATE_ID: 'YOUR_GOOGLE_DOC_TEMPLATE_ID',    // Create a charge sheet template in Google Docs
  SCHOOL_CONTACT: {
    name: 'Your School Name',
    phone: '555-123-4567',
    email: 'info@yourschool.org',
    address: '123 Main St, City, ST 12345',
    itEmail: 'admin@example.com',
    itPhone: '555-123-4567'
  },
  // ... other settings
};
```

### Step 5: Secure API Token Setup

**IMPORTANT:** Never hardcode your API token in the code. Use PropertiesService for secure storage.

1. In Apps Script editor, create a new function:

```javascript
function setupApiToken() {
  const apiToken = 'YOUR_INCIDENTIQ_API_TOKEN_HERE'; // Paste your JWT token
  PropertiesService.getScriptProperties().setProperty('INCIDENTIQ_API_TOKEN', apiToken);
  Logger.log('API token configured successfully');
}
```

2. Run `setupApiToken()` once from the Apps Script editor
3. Delete the function after running (or remove the token value)
4. The token is now securely stored and retrieved by `getIncidentIQConfig()`

### Step 6: Update Email Domain Validation

Edit `src/utils/Validators.gs`:

```javascript
// Line 101-102: Update to your school's email domain
if (!fullEmail.includes('@yourschool.org')) {
  return { isValid: false, error: 'Must use school email domain (@yourschool.org)' };
}

// Line 115: Update domain appending
fullEmail = sanitized + '@yourschool.org';
```

### Step 7: Deploy as Web App

1. In Apps Script editor, click **Deploy → New Deployment**
2. Select type: **Web app**
3. Configuration:
   - **Description**: "Device Checkout System v1.0"
   - **Execute as**: Me (your account)
   - **Who has access**: Anyone within your organization (or Anyone for public access)
4. Click **Deploy**
5. Copy the web app URL
6. Share this URL with students/staff for device checkout

### Step 8: Configure Automated Triggers

Set up time-based triggers for automated functions:

1. In Apps Script editor: **Triggers** (clock icon)
2. Add these triggers:

| Function | Event | Time |
|----------|-------|------|
| `updateOverdueAlertsMorning` | Time-driven | Daily 7:00 AM |
| `autoDisableOverdueDevices` | Time-driven | Daily 2:20 PM |
| `sendDailyOverdueAlerts` | Time-driven | Daily 2:30 PM |
| `generateChargeSheets` | Time-driven | Daily 3:15 PM |

Adjust times based on your school schedule.

## 🔧 Configuration Options

### Performance Settings

```javascript
var CONFIG = {
  MAX_API_PAGES: 15,                    // Asset pagination limit
  MAX_USER_SEARCH_PAGES: null,          // null = unlimited user search
  EXTENDED_CACHE_DURATION_MS: 900000,   // 15 minutes for asset cache
  USER_CACHE_DURATION_MS: 600000,       // 10 minutes for user cache
  MAX_ACTIVE_CHECKOUTS: 1,              // Devices per student (configurable)
  API_TIMEOUT_MS: 30000,                // 30-second timeout
  DEVICE_CATEGORIES: ['Chromebook', 'Charger', 'Laptop', 'Technology'],
  USE_CATEGORY_FILTER: true             // Enable targeted fetching
};
```

### Security Settings

```javascript
var RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 10,          // Adjust based on your needs
  LOCKOUT_DURATION_MINUTES: 15          // Lockout period for rate limit violations
};
```

### Charge Sheet Settings

```javascript
var CHARGE_SHEET_CONFIG = {
  ENABLED: true,                         // Enable/disable charge sheet system
  THRESHOLD_DAYS: 3,                     // Days overdue before charge sheet
  REPLACEMENT_COSTS: {
    'Chromebook': 217.00,
    'Charger': 140.00,
    'Laptop': 400.00,
    'Tablet': 300.00
  },
  RETURN_DEADLINE_DAYS: 2                // Business days after charge sheet
};
```

## 🧪 Testing

Run the comprehensive test suite to verify your setup:

```javascript
// In Apps Script editor:
runAllTests();  // Runs 13+ security and functionality tests
```

Test coverage includes:
- Email validation and injection protection
- Asset tag validation
- Rate limiting functionality
- PII redaction in logs
- API timeout handling
- Cache functionality
- User search with fuzzy matching

## 📊 Usage

### For Students/Staff (Checkout)

1. Navigate to the web app URL
2. Enter student email (or username)
3. Start typing asset tag (autocomplete will suggest)
4. Click "Verify" to check availability
5. Select action (Check Out / Check In)
6. Submit form
7. System will:
   - Validate inputs
   - Update IncidentIQ (assign/unassign device)
   - Log transaction to Google Sheets
   - Send confirmation

### For IT Staff (Management)

**Monitor Checkouts:**
- Open Google Sheet → "Active Checkouts" tab
- Real-time view of all checked-out devices

**Review Overdue Devices:**
- Open Google Sheet → "Overdue Alerts" tab
- Automatically updated twice daily (7 AM, 2:30 PM)

**Handle Charge Sheets:**
- Check email for daily charge sheet notifications
- PDFs attached for devices 3+ days overdue
- Track in "Charge Sheet Tracking" sheet

**View Historical Data:**
- Archive sheets created monthly (Archive-YYYY-MM)
- Search past checkouts by student, device, or date

## 🔒 Security Features

### Input Validation & Sanitization
- Comprehensive email validation (15+ attack patterns blocked)
- Asset tag format enforcement (6-digit numeric)
- SQL injection prevention
- XSS attack prevention
- CRLF injection protection

### Rate Limiting
- Per-user request tracking
- Configurable limits (default: 10 requests/minute)
- Automatic lockout for violations (default: 15 minutes)
- Protected endpoints: checkout, return, search

### PII Protection
- FERPA-compliant redaction in logs
- Email masking in security logs
- Secure API token storage (PropertiesService)
- No sensitive data in client-side code

### API Security
- Bearer token authentication
- Required headers validation
- 30-second timeout protection
- Automatic retry logic with exponential backoff

## 🐛 Troubleshooting

### "API token not configured" error
- Run `setupApiToken()` function with your IncidentIQ API token
- Verify token is stored: `PropertiesService.getScriptProperties().getProperty('INCIDENTIQ_API_TOKEN')`

### "Asset not found" errors
- Verify `assetViewId` is correct in Config.gs
- Check that the asset exists in the specified IncidentIQ view
- Clear cache: `clearAllCaches()` and retry

### User search not working
- Verify `siteId` is correct
- Check that users exist in IncidentIQ
- Verify email domain matches in Validators.gs
- Review high school filtering settings if enabled (`ENABLE_HS_FILTERING`)

### Performance issues
- Check cache statistics: `getCacheStats()`
- Review `MAX_API_PAGES` setting (increase if needed)
- Enable category filtering: `USE_CATEGORY_FILTER: true`
- Check API response times in logs

### Email notifications not sending
- Verify `IT_STAFF_EMAILS` are correct in Config.gs
- Check Gmail sending limits (500 emails/day for Workspace)
- Review execution logs for email errors
- Verify triggers are set up correctly

## 📝 API Reference

### IncidentIQ API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1.0/assets` | POST | Fetch assets with filters |
| `/api/v1.0/assets/{id}/owner` | POST | Assign/unassign device owner |
| `/api/v1.0/users` | POST | Search users by email |

**Required Headers:**
- `Authorization: Bearer {token}`
- `SiteId: {siteId}`
- `Client: ApiClient`
- `Content-Type: application/json`

## 🤝 Contributing

This project is designed to be adaptable for any educational institution using IncidentIQ. Key areas for customization:

1. **Email Domain** - Update validation in `Validators.gs`
2. **Device Types** - Modify `DEVICE_CATEGORIES` in `Config.gs`
3. **Checkout Limits** - Adjust `MAX_ACTIVE_CHECKOUTS`
4. **Notification Schedule** - Update time triggers
5. **Charge Sheet Template** - Create custom Google Docs template
6. **Replacement Costs** - Update pricing in `CHARGE_SHEET_CONFIG`

## 📄 License

This project is provided as-is for educational institutions. Feel free to adapt and modify for your organization's needs.

## 🙏 Acknowledgments

Originally developed for educational device management with IncidentIQ integration. Built with Google Apps Script, leveraging Google Workspace services (Sheets, Gmail, Drive) for a comprehensive inventory management solution.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review execution logs in Apps Script editor (View → Logs)
3. Run test suite: `runAllTests()`
4. Check cache statistics: `getCacheStats()`

---

**Version:** 2.0
**Last Updated:** January 2026
**Platform:** Google Apps Script
