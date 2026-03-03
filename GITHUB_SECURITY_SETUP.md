# GitHub Security Setup Checklist

This document outlines all the steps you need to complete on GitHub to secure your repository before making it public.

## ✅ Pre-Publication Security Checklist

### Step 1: Review Local Changes

Before pushing to GitHub, verify all security files are in place:

```bash
cd /home/cam/Projects/Incident-IQ-Based-Checkout

# Verify security files exist
ls -la | grep -E "LICENSE|SECURITY.md|.env.example|.gitignore"

# Check git status
git status

# Review what will be committed
git diff HEAD

# Verify no sensitive data remains
grep -r "sidneycityschools\|cameron\|cody" . --include="*.gs" --include="*.html"
```

**Expected Result:** Only CSS variable names (--sidney-yellow) should appear, no real data.

---

### Step 2: Commit Security Files

```bash
# Add all new security files
git add .gitignore SECURITY.md LICENSE .env.example .github/

# Add updated files
git add README.md Main.gs src/ frontend/

# Create commit
git commit -m "Security: Sanitize project and add security documentation

- Remove all Sidney City Schools specific information
- Replace with generic placeholders and TODO comments
- Add comprehensive SECURITY.md with policies
- Add .env.example for configuration template
- Add LICENSE (MIT)
- Add GitHub Actions security scanning workflow
- Update README with security notice
- Remove sensitive documentation (15 files)

This commit prepares the repository for public release."

# Push to GitHub
git push origin main
```

---

### Step 3: Configure GitHub Repository Settings

#### A. General Settings

1. Navigate to: **Settings → General**

2. **Repository name**: Keep current or rename to something generic

3. **Description**: Add a clear description:
   ```
   Production-ready Google Apps Script system for managing device checkouts with IncidentIQ integration. Features comprehensive security, automated workflows, and FERPA-compliant data handling.
   ```

4. **Topics** (add tags for discoverability):
   - `google-apps-script`
   - `incidentiq`
   - `device-management`
   - `inventory-system`
   - `chromebook`
   - `education`
   - `ferpa-compliant`

5. **Features** - Configure as follows:
   ```
   ✅ Issues (enable for bug reports)
   ✅ Preserve this repository (if available)
   ❌ Wikis (disable unless needed)
   ❌ Sponsorships (disable unless needed)
   ✅ Discussions (optional - for community support)
   ❌ Projects (disable unless needed)
   ```

---

#### B. Security & Analysis Settings

1. Navigate to: **Settings → Security & analysis**

2. **Enable ALL security features**:
   ```
   ✅ Dependency graph
   ✅ Dependabot alerts
   ✅ Dependabot security updates
   ✅ Code scanning (CodeQL)
   ✅ Secret scanning
   ✅ Secret scanning push protection
   ```

3. **Configure Dependabot** (click "Enable" for each):
   - Dependabot alerts: Notifies you of vulnerabilities
   - Dependabot security updates: Auto-creates PRs for security fixes

4. **Secret Scanning Configuration**:
   - Click "Enable" for secret scanning
   - Click "Enable" for push protection
   - This prevents accidental credential commits

---

#### C. Branch Protection Rules

1. Navigate to: **Settings → Branches**

2. Click **"Add branch protection rule"**

3. **Branch name pattern**: `main`

4. **Enable these protections**:
   ```
   ✅ Require a pull request before merging
      ✅ Require approvals: 1 (or more if team)
      ✅ Dismiss stale pull request approvals when new commits are pushed
      ✅ Require review from Code Owners (optional)

   ✅ Require status checks to pass before merging
      ✅ Require branches to be up to date before merging
      When available, select:
         - security-scan / secret-scan
         - security-scan / sensitive-data-scan

   ✅ Require conversation resolution before merging
   ✅ Require signed commits (optional but recommended)
   ✅ Require linear history (optional)

   ✅ Do not allow bypassing the above settings
   ❌ Allow force pushes (keep disabled)
   ❌ Allow deletions (keep disabled)
   ```

5. Click **"Create"** to save

---

#### D. Actions Permissions

1. Navigate to: **Settings → Actions → General**

2. **Actions permissions**:
   ```
   ⚪ Allow enterprise, and select non-enterprise, actions and reusable workflows

   Or for maximum security:
   ⚪ Allow [your organization], and select non-[your organization], actions and reusable workflows

   Then check:
   ✅ Allow actions created by GitHub
   ✅ Allow actions by Marketplace verified creators

   Optionally specify allowed actions:
   - github/*
   - actions/*
   - gitleaks/gitleaks-action@*
   - trufflesecurity/trufflehog@*
   ```

3. **Workflow permissions**:
   ```
   ⚪ Read and write permissions
   ✅ Allow GitHub Actions to create and approve pull requests
   ```

4. Click **"Save"**

---

#### E. Code Security & Analysis

1. Navigate to: **Settings → Code security and analysis**

2. Click **"Set up code scanning"**

3. Select **"CodeQL Analysis"** → **"Configure"**

4. Review the auto-generated `.github/workflows/codeql.yml`

5. Commit the workflow file

---

### Step 4: Configure GitHub Security Advisories

1. Navigate to: **Security → Overview**

2. Click **"Enable security advisories"**

3. This allows you to:
   - Privately report and fix security issues
   - Request CVEs for vulnerabilities
   - Coordinate disclosure with reporters

---

### Step 5: Set Up Notifications

1. Navigate to: **Settings → Notifications** (your personal settings, not repo)

2. **Email notification preferences**:
   ```
   ✅ Security alerts
   ✅ Watching (for this repo)
   ✅ Participating (for discussions/issues you engage with)
   ```

3. **Vulnerability alerts**:
   ```
   ✅ Dependabot alerts
   ✅ Secret scanning alerts
   ✅ Code scanning alerts
   ```

---

### Step 6: Create Repository Secrets (for Actions)

1. Navigate to: **Settings → Secrets and variables → Actions**

2. Click **"New repository secret"**

3. Optional: Add secrets for enhanced scanning:
   ```
   Name: GITLEAKS_LICENSE (if you have Gitleaks Pro)
   Value: [your license key]
   ```

---

### Step 7: Review and Test Security Workflow

1. Navigate to: **Actions** tab

2. You should see the **"Security Scan"** workflow

3. Click **"Run workflow"** to test manually

4. Verify all jobs pass:
   - ✅ Secret Scan
   - ✅ Sensitive Data Scan
   - ✅ Configuration Check
   - ✅ Security Report

5. If any fail, review the logs and fix issues before making public

---

### Step 8: Add Topics and Labels

#### Topics (for discoverability)
1. Navigate to: **About** (gear icon on main page)

2. Add topics:
   ```
   google-apps-script, incidentiq, chromebook-management,
   device-checkout, inventory-management, education-technology,
   ferpa-compliant, school-it, asset-tracking
   ```

#### Labels (for issue management)
1. Navigate to: **Issues → Labels**

2. Create security-related labels:
   ```
   🔒 security (color: #b60205)
   🐛 bug (color: #d73a4a)
   📚 documentation (color: #0075ca)
   ✨ enhancement (color: #a2eeef)
   ❓ question (color: #d876e3)
   🚀 performance (color: #1d76db)
   ```

---

### Step 9: Pre-Publication Final Check

Run this checklist before making the repo public:

```bash
☐ All sensitive data removed from code
☐ .gitignore properly configured
☐ SECURITY.md exists and is complete
☐ LICENSE file added
☐ .env.example created
☐ README.md updated with security notice
☐ GitHub Actions workflow created and tested
☐ All security features enabled on GitHub
☐ Branch protection rules configured
☐ Dependabot enabled
☐ Secret scanning enabled
☐ No .env or credentials files in repository
☐ All TODO comments reviewed
☐ Test data verified (no production data)
☐ Documentation reviewed for accuracy
☐ Git history scanned (or repository freshly initialized)
```

---

### Step 10: Make Repository Public

**⚠️ WARNING: This action cannot be easily undone. Review everything first!**

1. Navigate to: **Settings → General → Danger Zone**

2. Click **"Change repository visibility"**

3. Select **"Make public"**

4. **Read all warnings carefully**

5. Type the repository name to confirm

6. Click **"I understand, make this repository public"**

---

### Step 11: Post-Publication Tasks

#### Immediate (within 24 hours):

```bash
☐ Verify GitHub Actions ran successfully
☐ Check for any secret scanning alerts
☐ Review the public repository as an anonymous user
☐ Test cloning and setup from fresh checkout
☐ Verify README renders correctly
☐ Check all links work
☐ Monitor first 24 hours for issues/forks
```

#### First Week:

```bash
☐ Watch for forks and star activity
☐ Review any opened issues
☐ Check GitHub Security insights
☐ Verify dependabot is scanning properly
☐ Review GitHub traffic/insights
```

#### Ongoing Maintenance:

```bash
☐ Monthly: Review access logs
☐ Monthly: Check for new Dependabot alerts
☐ Quarterly: Rotate example credentials in docs
☐ Quarterly: Review and update SECURITY.md
☐ Annually: Comprehensive security audit
```

---

## 🚨 Emergency Procedures

### If You Accidentally Commit Sensitive Data After Going Public

1. **Immediate Actions**:
   ```bash
   # DO NOT just delete the file and commit
   # The data is still in git history!

   # Option 1: Use BFG Repo Cleaner
   git clone --mirror git@github.com:yourusername/yourrepo.git
   java -jar bfg.jar --delete-files sensitive-file.txt yourrepo.git
   cd yourrepo.git
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force

   # Option 2: Use git filter-repo
   git filter-repo --path sensitive-file.txt --invert-paths
   git push --force
   ```

2. **Rotate Compromised Credentials**:
   - Immediately revoke exposed API tokens
   - Generate new tokens
   - Update configuration in production
   - Notify affected parties if needed

3. **GitHub Support**:
   - Contact GitHub Support to clear cached views
   - They can help remove sensitive data from pull request views

4. **Notification**:
   - If credentials were exposed, notify users via GitHub Security Advisory
   - Document the incident in SECURITY.md

---

## 📞 Support Resources

- **GitHub Docs**: https://docs.github.com/en/code-security
- **Security Best Practices**: https://docs.github.com/en/code-security/getting-started/github-security-features
- **Dependabot**: https://docs.github.com/en/code-security/dependabot
- **Secret Scanning**: https://docs.github.com/en/code-security/secret-scanning
- **CodeQL**: https://codeql.github.com/docs/

---

## ✅ Completion

Once you've completed all steps:

1. Take screenshots of your security settings for documentation
2. Create a private note with your security configuration
3. Set calendar reminders for maintenance tasks
4. Monitor the repository for the first week
5. Celebrate! 🎉 Your repository is now securely public

---

**Last Updated**: January 2026
**Version**: 1.0
