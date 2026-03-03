# Contributing to Incident IQ Checkout System

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOURUSERNAME/Incident-IQ-Based-Checkout.git
   cd Incident-IQ-Based-Checkout
   ```
3. **Create a branch** for your contribution:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check the existing issues to avoid duplicates
- Collect information about the bug (steps to reproduce, expected vs actual behavior, screenshots, etc.)

When creating a bug report, include:
- Clear, descriptive title
- Detailed steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (Google Apps Script version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! When suggesting an enhancement:
- Use a clear, descriptive title
- Provide detailed explanation of the proposed feature
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Code Contributions

We welcome code contributions! Areas where you can help:
- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- Test coverage improvements
- Security enhancements

## Development Setup

### Prerequisites

- Google Account
- Access to Google Apps Script
- Incident IQ API access
- Familiarity with JavaScript/Google Apps Script

### Setup Instructions

1. Copy the repository files to your Google Apps Script project
2. Set up Script Properties:
   ```
   INCIDENT_IQ_SITE_ID
   INCIDENT_IQ_API_KEY
   CHECKOUT_SHEET_ID
   CHARGE_SHEET_ID
   FORM_SHEET_ID
   STUDENT_ID_COLUMN
   VALID_ID_RANGES
   AUTHORIZED_USERS
   ```
3. Review the README.md for full configuration details

### Testing

Before submitting your contribution:
- Test your changes thoroughly
- Verify all security checks pass
- Ensure no sensitive data is exposed
- Test edge cases and error scenarios

## Coding Standards

### JavaScript/Google Apps Script Style

- Use **camelCase** for variable and function names
- Use **PascalCase** for class names
- Use **UPPER_SNAKE_CASE** for constants
- Use **2 spaces** for indentation
- Maximum line length: **100 characters**

### Code Quality

- Write clear, self-documenting code
- Add comments for complex logic
- Follow DRY (Don't Repeat Yourself) principle
- Use meaningful variable and function names
- Handle errors gracefully
- Validate all inputs

### Security Best Practices

- Never commit sensitive data (API keys, credentials)
- Always validate and sanitize user input
- Use parameterized queries to prevent injection attacks
- Follow principle of least privilege
- Log security-relevant events
- Keep dependencies updated

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements

### Examples

```
feat(checkout): Add bulk checkout functionality

Implemented batch processing for checking out multiple devices
at once. Includes validation and error handling.

Closes #123
```

```
fix(security): Prevent XSS in user input fields

Added input sanitization to all user-facing forms.

Security-Issue: #456
```

## Pull Request Process

### Before Submitting

1. Ensure your code follows the coding standards
2. Update documentation if needed
3. Add or update tests as appropriate
4. Verify all tests pass
5. Ensure security scan passes
6. Update CHANGELOG.md if applicable

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub with:
   - Clear, descriptive title
   - Detailed description of changes
   - Reference to related issues
   - Screenshots (if UI changes)
   - Testing performed

3. Address review feedback:
   - Respond to comments
   - Make requested changes
   - Push updates to your branch

### PR Review Process

- All PRs require at least one approval
- Security-related changes require additional review
- Automated checks must pass:
  - Security scanning
  - Code quality checks
  - Tests (if applicable)

### After Approval

- Your PR will be merged by a maintainer
- Your branch will be deleted
- Your contribution will be credited in the release notes

## Security

Security is a top priority. Please refer to [SECURITY.md](../SECURITY.md) for:
- Reporting security vulnerabilities
- Security best practices
- Responsible disclosure policy

**Never publicly disclose security vulnerabilities.** Use the private reporting feature or email directly.

## Questions?

If you have questions:
- Check existing issues and discussions
- Review the documentation
- Open a new issue with your question

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing! Your efforts help make this project better for everyone.
