# GraphBoarder E2E Tests

This directory contains comprehensive end-to-end tests for the GraphBoarder application using Playwright.

## Test Files

### 1. `test.ts`

Basic test to verify the application setup.

### 2. `user-flow.spec.ts`

Tests the basic user flow through the application:

- Clicking "Get Started" button
- Selecting an endpoint from the table
- Opening the drawer/sidebar
- Navigating to Queries tab
- Clicking on query items (including "documents" query)

### 3. `advanced-user-flows.spec.ts`

Comprehensive tests covering advanced functionality:

#### Filter Tests

- **Radio Filter Selection**: Tests selecting single-choice filters
- **Checkbox Filter Selection**: Tests selecting multiple filter options
- **Drag and Drop Reordering**: Tests reordering filter items using drag handles

#### Column Management

- **Adding Columns**: Tests the column addition dropdown and field selection
- **Hiding Columns**: Tests removing columns from the table view

#### UI Interaction

- **Control Panel**: Tests toggling the control panel visibility
- **QMS Body Display**: Tests showing/hiding GraphQL query code
- **Table Row Selection**: Tests selecting rows with checkboxes/radio buttons

#### Navigation

- **Explorer Page**: Tests navigating to the Explorer tab
- **Mutations Page**: Tests navigating to and interacting with mutations

#### Integration Tests

- **Complete User Journey**: Tests multiple interactions in sequence

### 4. `page-navigation.spec.ts`

Tests for page navigation and routing:

#### Main Navigation

- **Full Navigation Flow**: Tests navigating through all main sections
- **Endpoint Type Switching**: Tests switching between local, localstorage, and remote endpoints
- **Sidebar Interaction**: Tests sidebar visibility on mobile viewports
- **Home Button Navigation**: Tests returning to home via sidebar

#### State Management

- **Breadcrumb Navigation**: Tests browser back/forward buttons
- **Multiple Query Navigation**: Tests navigating through different queries
- **Persistent State**: Tests state preservation across navigation

#### Error Handling

- **Error Resilience**: Tests graceful handling of invalid URLs
- **Page Recovery**: Tests application stability after navigation errors

## Running the Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/user-flow.spec.ts

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests matching a pattern
npx playwright test -g "filter"

# Debug a specific test
npx playwright test tests/advanced-user-flows.spec.ts --debug
```

### Viewing Test Results

```bash
# View HTML report after test run
npx playwright show-report
```

## Test Architecture

### Helper Functions

The tests use shared helper functions to reduce duplication:

- `navigateToQueryPage()`: Common navigation flow to reach a query detail page

### Page Objects Pattern

Tests interact with the UI using Playwright's locator strategy:

- Semantic selectors (text content, ARIA labels)
- CSS selectors for specific components
- Fallback strategies for resilient tests

### Waiting Strategies

Tests use multiple waiting strategies for reliability:

- `waitForLoadState('domcontentloaded')`: Wait for DOM to be ready
- `waitForLoadState('networkidle')`: Wait for network requests to complete
- `waitForTimeout()`: Wait for animations and transitions
- `waitForURL()`: Wait for navigation to complete

## Test Coverage

The test suite covers:

### User Flows

- ✅ Basic navigation through the application
- ✅ Endpoint selection and detail views
- ✅ Query browsing and execution
- ✅ Mutation navigation

### Filtering & Arguments

- ✅ Radio button filters
- ✅ Checkbox filters
- ✅ Filter reordering via drag and drop
- ✅ Filter application and removal

### Data Management

- ✅ Column addition
- ✅ Column removal/hiding
- ✅ Table row selection
- ✅ Multi-select functionality

### UI Components

- ✅ Modal dialogs
- ✅ Dropdown menus
- ✅ Sidebar/drawer behavior
- ✅ Control panel toggle
- ✅ Code display toggle

### Responsive Design

- ✅ Mobile viewport behavior
- ✅ Hamburger menu interaction
- ✅ Sidebar auto-hide on mobile

### State & Navigation

- ✅ Browser back/forward
- ✅ Deep linking
- ✅ Error handling
- ✅ State persistence

## Writing New Tests

### Best Practices

1. **Use Descriptive Test Names**

   ```typescript
   test('test query with filter selection - radio type', async ({ page, context }) => {
   ```

2. **Wait for Elements Properly**

   ```typescript
   await expect(element).toBeVisible({ timeout: 10000 });
   await page.waitForLoadState('networkidle');
   ```

3. **Handle Optional Elements**

   ```typescript
   const elementExists = await element.isVisible().catch(() => false);
   if (elementExists) {
	// interact with element
   }
   ```

4. **Use Context for Multi-Page Scenarios**

   ```typescript
   const [newPage] = await Promise.all([context.waitForEvent('page'), element.click()]);
   ```

5. **Verify State Changes**
   ```typescript
   const appliedFilter = await filterButton.getAttribute('class');
   expect(appliedFilter).toContain('btn-primary');
   ```

## Debugging Tests

### Visual Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Run in debug mode with Playwright Inspector
npx playwright test --debug
```

### Screenshots and Videos

The Playwright config can be updated to capture screenshots and videos:

```typescript
use: {
  screenshot: 'on',
  video: 'on'
}
```

### Trace Viewer

```bash
# Record trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Known Issues & Limitations

1. **Browser Downloads**: Some environments may block Playwright browser downloads (403 errors). Run tests locally or in approved CI environments.

2. **Timing Issues**: Some tests use fixed timeouts for animations. Adjust if tests are flaky.

3. **Dynamic Content**: Tests assume certain queries/endpoints exist. They gracefully handle missing elements but coverage may vary.

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add descriptive comments for complex interactions
3. Use helper functions to reduce duplication
4. Test both success and error scenarios
5. Update this README with new test descriptions
