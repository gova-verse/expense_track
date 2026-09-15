# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Expense Tracker – Full Flow >> 3. Navigation >> 3c. Navigate to Transactions page
- Location: tests\auth.spec.ts:154:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('All Transactions')

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e2]:
    - generic [ref=f1e5]:
      - list [ref=f1e7]:
        - listitem [ref=f1e8]:
          - button "I-E Income-to-Expense" [ref=f1e9]:
            - generic [ref=f1e13]:
              - generic [ref=f1e14]: I-E
              - generic [ref=f1e15]: Income-to-Expense
      - generic [ref=f1e18]:
        - generic [ref=f1e19]:
          - generic [ref=f1e20]: Track here
          - list [ref=f1e21]:
            - listitem [ref=f1e22]:
              - link "Dashboard" [ref=f1e23] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=f1e27]:
              - link "Accounts" [ref=f1e28] [cursor=pointer]:
                - /url: /dashboard/accounts
            - listitem [ref=f1e32]:
              - link "Transactions" [ref=f1e33] [cursor=pointer]:
                - /url: /dashboard/transactions
            - listitem [ref=f1e39]:
              - link "Categories" [ref=f1e40] [cursor=pointer]:
                - /url: "#"
        - generic [ref=f1e46]:
          - generic [ref=f1e47]: Insights
          - list [ref=f1e48]:
            - listitem [ref=f1e49]:
              - link "Reports" [ref=f1e50] [cursor=pointer]:
                - /url: /dashboard/reports
              - button "More" [ref=f1e54]
            - listitem [ref=f1e58]:
              - link "Budgets" [ref=f1e59] [cursor=pointer]:
                - /url: /dashboard/budgets
              - button "More" [ref=f1e63]
            - listitem [ref=f1e67]:
              - link "Settings" [ref=f1e68] [cursor=pointer]:
                - /url: /dashboard/settings
      - list [ref=f1e75]:
        - listitem [ref=f1e76]:
          - button "PT Playwright Tester pw_test_1789443361367@example.com" [ref=f1e77]:
            - generic [ref=f1e78]: PT
            - generic [ref=f1e80]:
              - generic [ref=f1e81]: Playwright Tester
              - generic [ref=f1e82]: pw_test_1789443361367@example.com
      - button "Toggle Sidebar" [ref=f1e86]
    - main [ref=f1e87]:
      - generic [ref=f1e89]:
        - button "Toggle Sidebar" [ref=f1e90]
        - navigation "breadcrumb" [ref=f1e92]:
          - list [ref=f1e93]:
            - listitem [ref=f1e94]:
              - link "Dashboard" [ref=f1e95] [cursor=pointer]:
                - /url: /dashboard
      - main [ref=f1e96]:
        - generic [ref=f1e97]:
          - generic [ref=f1e98]:
            - heading "Transactions" [level=1] [ref=f1e99]
            - button "Add Transaction" [ref=f1e100]
          - generic [ref=f1e102]:
            - generic [ref=f1e103]:
              - generic [ref=f1e104]: Type
              - combobox [ref=f1e105]:
                - option "All Types" [selected]
                - option "Expense"
                - option "Income"
                - option "Transfer"
            - generic [ref=f1e106]:
              - generic [ref=f1e107]: Category
              - combobox [ref=f1e108]:
                - option "All Categories" [selected]
                - option "Food"
                - option "Transport"
                - option "Shopping"
                - option "Entertainment"
                - option "Bills"
                - option "Rent"
                - option "Health"
                - option "Education"
                - option "Travel"
                - option "Personal"
                - option "Other"
                - option "Salary"
                - option "Freelance"
                - option "Business"
                - option "Investment"
                - option "Interest"
                - option "Rental"
                - option "Gift"
                - option "Refund"
                - option "Other Income"
            - generic [ref=f1e109]:
              - generic [ref=f1e110]: Month
              - textbox [ref=f1e111]
          - paragraph [ref=f1e113]: No transactions yet. Add your first expense or income to start tracking your finances.
  - button "Open Next.js Dev Tools" [ref=f1e119] [cursor=pointer]
  - alert [ref=f1e123]
```

# Test source

```ts
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
  135 | 
  136 |     test('3a. Sidebar shows all navigation items', async ({ page }) => {
  137 |       // Main nav
  138 |       await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 10000 });
  139 |       await expect(page.getByText('Accounts').first()).toBeVisible();
  140 |       await expect(page.getByText('Transactions').first()).toBeVisible();
  141 |       await expect(page.getByText('Categories').first()).toBeVisible();
  142 | 
  143 |       // Insights nav
  144 |       await expect(page.getByText('Reports').first()).toBeVisible();
  145 |       await expect(page.getByText('Budgets').first()).toBeVisible();
  146 |       await expect(page.getByText('Settings').first()).toBeVisible();
  147 |     });
  148 | 
  149 |     test('3b. Navigate to Accounts page', async ({ page }) => {
  150 |       await page.getByText('Accounts').first().click();
  151 |       await expect(page).toHaveURL(/\/dashboard\/accounts/, { timeout: 10000 });
  152 |     });
  153 | 
  154 |     test('3c. Navigate to Transactions page', async ({ page }) => {
  155 |       // Expand Transactions submenu
  156 |       await page.getByText('Transactions').first().click();
> 157 |       await page.getByText('All Transactions').click();
      |                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  158 |       await expect(page).toHaveURL(/\/dashboard\/transactions/, { timeout: 10000 });
  159 |     });
  160 | 
  161 |     test('3d. Navigate to Budgets page', async ({ page }) => {
  162 |       await page.getByText('Budgets').first().click();
  163 |       await expect(page).toHaveURL(/\/dashboard\/budgets/, { timeout: 10000 });
  164 |     });
  165 | 
  166 |     test('3e. Navigate to Reports page', async ({ page }) => {
  167 |       await page.getByText('Reports').first().click();
  168 |       await expect(page).toHaveURL(/\/dashboard\/reports/, { timeout: 10000 });
  169 |     });
  170 |   });
  171 | 
  172 |   // ── 4. Accounts Page ──────────────────────────────────────────────────────
  173 | 
  174 |   test.describe('4. Accounts', () => {
  175 |     test.beforeEach(async ({ page }) => {
  176 |       await login(page);
  177 |       await page.goto('/dashboard/accounts');
  178 |       await page.waitForLoadState('networkidle');
  179 |     });
  180 | 
  181 |     test('4a. Accounts page loads', async ({ page }) => {
  182 |       // Check the page has loaded (look for Add Account button or heading)
  183 |       await expect(page.getByRole('button', { name: /add account/i }).or(page.getByText('Accounts').first())).toBeVisible({ timeout: 10000 });
  184 |     });
  185 | 
  186 |     test('4b. Can open Add Account form', async ({ page }) => {
  187 |       const addButton = page.getByRole('button', { name: /add account/i });
  188 |       if (await addButton.isVisible()) {
  189 |         await addButton.click();
  190 |         // Look for the form fields
  191 |         await expect(page.locator('[id="name"], input[name="name"]').first()).toBeVisible({ timeout: 5000 });
  192 |       }
  193 |     });
  194 |   });
  195 | 
  196 |   // ── 5. Transactions Page ──────────────────────────────────────────────────
  197 | 
  198 |   test.describe('5. Transactions', () => {
  199 |     test.beforeEach(async ({ page }) => {
  200 |       await login(page);
  201 |       await page.goto('/dashboard/transactions');
  202 |       await page.waitForLoadState('networkidle');
  203 |     });
  204 | 
  205 |     test('5a. Transactions page loads', async ({ page }) => {
  206 |       // The page should load successfully
  207 |       await expect(page.getByRole('button', { name: /add/i }).or(page.getByText('Transactions').first())).toBeVisible({ timeout: 10000 });
  208 |     });
  209 |   });
  210 | 
  211 |   // ── 6. Categories Page ────────────────────────────────────────────────────
  212 | 
  213 |   test.describe('6. Categories', () => {
  214 |     test.beforeEach(async ({ page }) => {
  215 |       await login(page);
  216 |     });
  217 | 
  218 |     test('6a. Expense categories page loads', async ({ page }) => {
  219 |       await page.goto('/dashboard/categories/expense');
  220 |       await page.waitForLoadState('networkidle');
  221 |       // Default categories from seed should be visible
  222 |       await expect(page.getByText('Food').first()).toBeVisible({ timeout: 10000 });
  223 |     });
  224 | 
  225 |     test('6b. Income categories page loads', async ({ page }) => {
  226 |       await page.goto('/dashboard/categories/income');
  227 |       await page.waitForLoadState('networkidle');
  228 |       await expect(page.getByText('Salary').first()).toBeVisible({ timeout: 10000 });
  229 |     });
  230 |   });
  231 | 
  232 |   // ── 7. Budgets Page ───────────────────────────────────────────────────────
  233 | 
  234 |   test.describe('7. Budgets', () => {
  235 |     test.beforeEach(async ({ page }) => {
  236 |       await login(page);
  237 |       await page.goto('/dashboard/budgets');
  238 |       await page.waitForLoadState('networkidle');
  239 |     });
  240 | 
  241 |     test('7a. Budgets page loads', async ({ page }) => {
  242 |       await expect(page.getByRole('button', { name: /add|create|new/i }).or(page.getByText('Budgets').first())).toBeVisible({ timeout: 10000 });
  243 |     });
  244 |   });
  245 | 
  246 |   // ── 8. Reports Page ───────────────────────────────────────────────────────
  247 | 
  248 |   test.describe('8. Reports', () => {
  249 |     test.beforeEach(async ({ page }) => {
  250 |       await login(page);
  251 |       await page.goto('/dashboard/reports');
  252 |       await page.waitForLoadState('networkidle');
  253 |     });
  254 | 
  255 |     test('8a. Reports page loads', async ({ page }) => {
  256 |       // Reports page should load and show some report content
  257 |       await expect(page.locator('body')).toBeVisible();
```