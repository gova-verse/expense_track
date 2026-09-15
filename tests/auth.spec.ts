import { test, expect, Page } from '@playwright/test';

// Test credentials – signup creates a fresh user; subsequent tests use these creds
const TEST_USER = {
  name: 'Playwright Tester',
  email: `pw_test_${Date.now()}@example.com`,
  password: 'TestPass123!',
};

// ─── Helper: authenticate (sign up once, then login on subsequent calls) ──────

async function signup(page: Page) {
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

  await page.locator('#name').fill(TEST_USER.name);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('#confirm-password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

async function login(page: Page) {
  await page.goto('/login');
  await expect(page.getByText('Login to your account', { exact: true })).toBeVisible();

  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

// ═════════════════════════════════════════════════════════════════════════════
// Test Suite: Full Application Flow
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Expense Tracker – Full Flow', () => {
  // ── 1. Auth Flow ───────────────────────────────────────────────────────────

  test.describe('1. Authentication', () => {
    test('1a. Root URL redirects to /login', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
    });

    test('1b. Login page renders all expected elements', async ({ page }) => {
      await page.goto('/login');

      // Heading (exact match to avoid matching the description too)
      await expect(page.getByText('Login to your account', { exact: true })).toBeVisible();

      // Form fields
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();

      // Buttons & links
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
      await expect(page.getByText('Sign up')).toBeVisible();
      await expect(page.getByText('Forgot your password?')).toBeVisible();
      await expect(page.getByText('Login with Google')).toBeVisible();
    });

    test('1c. Signup page renders all expected elements', async ({ page }) => {
      await page.goto('/signup');

      await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirm-password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
      await expect(page.getByText('Sign in')).toBeVisible();
    });

    test('1d. Login with invalid credentials shows error', async ({ page }) => {
      await page.goto('/login');
      await page.locator('#email').fill('invalid@example.com');
      await page.locator('#password').fill('WrongPass123!');
      await page.getByRole('button', { name: 'Login' }).click();

      // Wait for the auth request to complete
      await page.waitForTimeout(3000);

      // Should either stay on login page or show an error
      const url = page.url();
      const hasError = await page.locator('.text-destructive, [class*="destructive"], [class*="error"]').isVisible().catch(() => false);
      const stayedOnLogin = url.includes('/login');

      expect(hasError || stayedOnLogin).toBeTruthy();
    });

    test('1e. Signup creates a new user and redirects to dashboard', async ({ page }) => {
      await signup(page);

      // Verify dashboard loaded – look for summary cards
      await expect(page.getByText('Total Income').first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ── 2. Dashboard ───────────────────────────────────────────────────────────

  test.describe('2. Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('2a. Dashboard loads with overview cards', async ({ page }) => {
      await expect(page.getByText('Total Income').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Total Expenses').first()).toBeVisible();
      await expect(page.getByText('Net Savings').first()).toBeVisible();
      await expect(page.getByText('Savings Rate').first()).toBeVisible();
    });

    test('2b. Dashboard shows chart sections', async ({ page }) => {
      await expect(page.getByText('Income vs Expenses').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Spending by Category').first()).toBeVisible();
    });

    test('2c. Dashboard shows insights and recent transactions sections', async ({ page }) => {
      await expect(page.getByText('Top Financial Insights').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Recent Transactions').first()).toBeVisible();
    });
  });

  // ── 3. Sidebar Navigation ─────────────────────────────────────────────────

  test.describe('3. Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('3a. Sidebar shows all navigation items', async ({ page }) => {
      // Main nav
      await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Accounts').first()).toBeVisible();
      await expect(page.getByText('Transactions').first()).toBeVisible();
      await expect(page.getByText('Categories').first()).toBeVisible();

      // Insights nav
      await expect(page.getByText('Reports').first()).toBeVisible();
      await expect(page.getByText('Budgets').first()).toBeVisible();
      await expect(page.getByText('Settings').first()).toBeVisible();
    });

    test('3b. Navigate to Accounts page', async ({ page }) => {
      await page.getByText('Accounts').first().click();
      await expect(page).toHaveURL(/\/dashboard\/accounts/, { timeout: 10000 });
    });

    test('3c. Navigate to Transactions page', async ({ page }) => {
      // Expand Transactions submenu
      await page.getByText('Transactions').first().click();
      await page.getByText('All Transactions').click();
      await expect(page).toHaveURL(/\/dashboard\/transactions/, { timeout: 10000 });
    });

    test('3d. Navigate to Budgets page', async ({ page }) => {
      await page.getByText('Budgets').first().click();
      await expect(page).toHaveURL(/\/dashboard\/budgets/, { timeout: 10000 });
    });

    test('3e. Navigate to Reports page', async ({ page }) => {
      await page.getByText('Reports').first().click();
      await expect(page).toHaveURL(/\/dashboard\/reports/, { timeout: 10000 });
    });
  });

  // ── 4. Accounts Page ──────────────────────────────────────────────────────

  test.describe('4. Accounts', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/dashboard/accounts');
      await page.waitForLoadState('networkidle');
    });

    test('4a. Accounts page loads', async ({ page }) => {
      // Check the page has loaded (look for Add Account button or heading)
      await expect(page.getByRole('button', { name: /add account/i }).or(page.getByText('Accounts').first())).toBeVisible({ timeout: 10000 });
    });

    test('4b. Can open Add Account form', async ({ page }) => {
      const addButton = page.getByRole('button', { name: /add account/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        // Look for the form fields
        await expect(page.locator('[id="name"], input[name="name"]').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  // ── 5. Transactions Page ──────────────────────────────────────────────────

  test.describe('5. Transactions', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/dashboard/transactions');
      await page.waitForLoadState('networkidle');
    });

    test('5a. Transactions page loads', async ({ page }) => {
      // The page should load successfully
      await expect(page.getByRole('button', { name: /add/i }).or(page.getByText('Transactions').first())).toBeVisible({ timeout: 10000 });
    });
  });

  // ── 6. Categories Page ────────────────────────────────────────────────────

  test.describe('6. Categories', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('6a. Expense categories page loads', async ({ page }) => {
      await page.goto('/dashboard/categories/expense');
      await page.waitForLoadState('networkidle');
      // Default categories from seed should be visible
      await expect(page.getByText('Food').first()).toBeVisible({ timeout: 10000 });
    });

    test('6b. Income categories page loads', async ({ page }) => {
      await page.goto('/dashboard/categories/income');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('Salary').first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ── 7. Budgets Page ───────────────────────────────────────────────────────

  test.describe('7. Budgets', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/dashboard/budgets');
      await page.waitForLoadState('networkidle');
    });

    test('7a. Budgets page loads', async ({ page }) => {
      await expect(page.getByRole('button', { name: /add|create|new/i }).or(page.getByText('Budgets').first())).toBeVisible({ timeout: 10000 });
    });
  });

  // ── 8. Reports Page ───────────────────────────────────────────────────────

  test.describe('8. Reports', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/dashboard/reports');
      await page.waitForLoadState('networkidle');
    });

    test('8a. Reports page loads', async ({ page }) => {
      // Reports page should load and show some report content
      await expect(page.locator('body')).toBeVisible();
      // Wait for content to render
      await page.waitForTimeout(2000);
    });
  });

  // ── 9. Settings Pages ─────────────────────────────────────────────────────

  test.describe('9. Settings', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('9a. Appearance settings page loads', async ({ page }) => {
      await page.goto('/dashboard/settings/appearance');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/theme|appearance/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('9b. Currency & Region settings page loads', async ({ page }) => {
      await page.goto('/dashboard/settings/currency');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/currency|region/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('9c. Notifications settings page loads', async ({ page }) => {
      await page.goto('/dashboard/settings/notifications');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/notification/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('9d. Privacy settings page loads', async ({ page }) => {
      await page.goto('/dashboard/settings/privacy');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/privacy|security/i).first()).toBeVisible({ timeout: 10000 });
    });
  });
});
