# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Expense Tracker – Full Flow >> 7. Budgets >> 7a. Budgets page loads
- Location: tests\auth.spec.ts:241:9

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://localhost:3000/login"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × locator resolved to <html lang="en" class="light">…</html>
       - unexpected value "http://localhost:3000/login"

```

```yaml
- text: Login to your account Enter your email below to login to your account
- group:
  - text: Email
  - textbox "Email":
    - /placeholder: m@example.com
    - text: pw_test_1789443547932@example.com
- group:
  - text: Password
  - link "Forgot your password?":
    - /url: /forgot-password
  - textbox "Password": TestPass123!
- text: Invalid email or password
- group:
  - button "Login"
  - link "Login with Google":
    - /url: "#"
  - paragraph:
    - text: Don't have an account?
    - link "Sign up":
      - /url: /signup
- alert
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | // Test credentials – signup creates a fresh user; subsequent tests use these creds
  4   | const TEST_USER = {
  5   |   name: 'Playwright Tester',
  6   |   email: `pw_test_${Date.now()}@example.com`,
  7   |   password: 'TestPass123!',
  8   | };
  9   | 
  10  | // ─── Helper: authenticate (sign up once, then login on subsequent calls) ──────
  11  | 
  12  | async function signup(page: Page) {
  13  |   await page.goto('/signup');
  14  |   await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  15  | 
  16  |   await page.locator('#name').fill(TEST_USER.name);
  17  |   await page.locator('#email').fill(TEST_USER.email);
  18  |   await page.locator('#password').fill(TEST_USER.password);
  19  |   await page.locator('#confirm-password').fill(TEST_USER.password);
  20  |   await page.getByRole('button', { name: 'Create Account' }).click();
  21  | 
  22  |   // Wait for redirect to dashboard
  23  |   await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  24  | }
  25  | 
  26  | async function login(page: Page) {
  27  |   await page.goto('/login');
  28  |   await expect(page.getByText('Login to your account', { exact: true })).toBeVisible();
  29  | 
  30  |   await page.locator('#email').fill(TEST_USER.email);
  31  |   await page.locator('#password').fill(TEST_USER.password);
  32  |   await page.getByRole('button', { name: 'Login' }).click();
  33  | 
> 34  |   await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  35  | }
  36  | 
  37  | // ═════════════════════════════════════════════════════════════════════════════
  38  | // Test Suite: Full Application Flow
  39  | // ═════════════════════════════════════════════════════════════════════════════
  40  | 
  41  | test.describe('Expense Tracker – Full Flow', () => {
  42  |   // ── 1. Auth Flow ───────────────────────────────────────────────────────────
  43  | 
  44  |   test.describe('1. Authentication', () => {
  45  |     test('1a. Root URL redirects to /login', async ({ page }) => {
  46  |       await page.goto('/');
  47  |       await expect(page).toHaveURL(/\/login/);
  48  |     });
  49  | 
  50  |     test('1b. Login page renders all expected elements', async ({ page }) => {
  51  |       await page.goto('/login');
  52  | 
  53  |       // Heading (exact match to avoid matching the description too)
  54  |       await expect(page.getByText('Login to your account', { exact: true })).toBeVisible();
  55  | 
  56  |       // Form fields
  57  |       await expect(page.locator('#email')).toBeVisible();
  58  |       await expect(page.locator('#password')).toBeVisible();
  59  | 
  60  |       // Buttons & links
  61  |       await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  62  |       await expect(page.getByText('Sign up')).toBeVisible();
  63  |       await expect(page.getByText('Forgot your password?')).toBeVisible();
  64  |       await expect(page.getByText('Login with Google')).toBeVisible();
  65  |     });
  66  | 
  67  |     test('1c. Signup page renders all expected elements', async ({ page }) => {
  68  |       await page.goto('/signup');
  69  | 
  70  |       await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  71  |       await expect(page.locator('#name')).toBeVisible();
  72  |       await expect(page.locator('#email')).toBeVisible();
  73  |       await expect(page.locator('#password')).toBeVisible();
  74  |       await expect(page.locator('#confirm-password')).toBeVisible();
  75  |       await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  76  |       await expect(page.getByText('Sign in')).toBeVisible();
  77  |     });
  78  | 
  79  |     test('1d. Login with invalid credentials shows error', async ({ page }) => {
  80  |       await page.goto('/login');
  81  |       await page.locator('#email').fill('invalid@example.com');
  82  |       await page.locator('#password').fill('WrongPass123!');
  83  |       await page.getByRole('button', { name: 'Login' }).click();
  84  | 
  85  |       // Wait for the auth request to complete
  86  |       await page.waitForTimeout(3000);
  87  | 
  88  |       // Should either stay on login page or show an error
  89  |       const url = page.url();
  90  |       const hasError = await page.locator('.text-destructive, [class*="destructive"], [class*="error"]').isVisible().catch(() => false);
  91  |       const stayedOnLogin = url.includes('/login');
  92  | 
  93  |       expect(hasError || stayedOnLogin).toBeTruthy();
  94  |     });
  95  | 
  96  |     test('1e. Signup creates a new user and redirects to dashboard', async ({ page }) => {
  97  |       await signup(page);
  98  | 
  99  |       // Verify dashboard loaded – look for summary cards
  100 |       await expect(page.getByText('Total Income').first()).toBeVisible({ timeout: 10000 });
  101 |     });
  102 |   });
  103 | 
  104 |   // ── 2. Dashboard ───────────────────────────────────────────────────────────
  105 | 
  106 |   test.describe('2. Dashboard', () => {
  107 |     test.beforeEach(async ({ page }) => {
  108 |       await login(page);
  109 |     });
  110 | 
  111 |     test('2a. Dashboard loads with overview cards', async ({ page }) => {
  112 |       await expect(page.getByText('Total Income').first()).toBeVisible({ timeout: 10000 });
  113 |       await expect(page.getByText('Total Expenses').first()).toBeVisible();
  114 |       await expect(page.getByText('Net Savings').first()).toBeVisible();
  115 |       await expect(page.getByText('Savings Rate').first()).toBeVisible();
  116 |     });
  117 | 
  118 |     test('2b. Dashboard shows chart sections', async ({ page }) => {
  119 |       await expect(page.getByText('Income vs Expenses').first()).toBeVisible({ timeout: 10000 });
  120 |       await expect(page.getByText('Spending by Category').first()).toBeVisible();
  121 |     });
  122 | 
  123 |     test('2c. Dashboard shows insights and recent transactions sections', async ({ page }) => {
  124 |       await expect(page.getByText('Top Financial Insights').first()).toBeVisible({ timeout: 10000 });
  125 |       await expect(page.getByText('Recent Transactions').first()).toBeVisible();
  126 |     });
  127 |   });
  128 | 
  129 |   // ── 3. Sidebar Navigation ─────────────────────────────────────────────────
  130 | 
  131 |   test.describe('3. Navigation', () => {
  132 |     test.beforeEach(async ({ page }) => {
  133 |       await login(page);
  134 |     });
```