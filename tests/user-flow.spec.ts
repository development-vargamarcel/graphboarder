import { expect, test } from '@playwright/test';

test.describe('User Flow Tests', () => {
	test('complete user flow: get started -> endpoints table -> drawer -> queries -> documents', async ({
		page,
		context
	}) => {
		// Step 1: Navigate to home page
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		// Step 2: Click on "Get Started" button
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await expect(getStartedButton).toBeVisible();
		await getStartedButton.click();

		// Wait for navigation to /endpoints
		await page.waitForURL(/\/endpoints/);
		await page.waitForLoadState('networkidle');

		// Step 3: Click on the first row in the table
		// The ExplorerTable component dispatches a rowClicked event when a row is clicked
		// Since clicking the row opens a new window, we need to handle the popup
		const firstRow = page.locator('tbody tr').first();
		await expect(firstRow).toBeVisible({ timeout: 10000 });

		const [newPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		// Wait for the new page to load
		await newPage.waitForLoadState('domcontentloaded');
		await newPage.waitForLoadState('networkidle');

		// Step 4: Open the drawer (hamburger menu for mobile/sidebar)
		// The drawer toggle is the hamburger button - visible on mobile or when sidebar is hidden
		const drawerButton = newPage
			.locator('label.btn.btn-square.btn-ghost, button.btn.btn-square.btn-ghost')
			.first();

		// Check if drawer button is visible (might not be on desktop)
		const isDrawerButtonVisible = await drawerButton.isVisible();
		if (isDrawerButtonVisible) {
			await drawerButton.click();
			// Wait for drawer animation
			await newPage.waitForTimeout(500);
		}

		// Step 5: Click on "Queries" tab in the sidebar
		// The sidebar contains tabs for Queries, Mutations, Explorer
		// Look for the Queries link/button in the TabContainer
		const queriesTab = newPage.locator('a[href*="/queries"]').first();
		await expect(queriesTab).toBeVisible({ timeout: 10000 });
		await queriesTab.click();

		// Wait for the queries page to load and sidebar items to appear
		await newPage.waitForTimeout(1000);
		await newPage.waitForLoadState('networkidle');

		// Step 6: Click on "documents" or the first query item in the sidebar list
		// The queries list appears in the itemsToShow section of TabContainer
		// First, try to find a query specifically named "documents"
		const documentsLink = newPage.locator('ul.space-y-1 li a:has-text("documents")').first();
		const firstQueryItem = newPage.locator('ul.space-y-1 li a').first();

		// Check if "documents" link exists, otherwise click the first query
		const documentsExists = (await documentsLink.count()) > 0;
		if (documentsExists) {
			await expect(documentsLink).toBeVisible();
			await documentsLink.click();
		} else {
			// If "documents" doesn't exist, click the first query item
			await expect(firstQueryItem).toBeVisible({ timeout: 10000 });
			await firstQueryItem.click();
		}

		// Wait for the query page to load
		await newPage.waitForLoadState('networkidle');

		// Verify we're on a query detail page
		await expect(newPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);

		// Additional verification: check that we're on a page with table content
		const tableExists = (await newPage.locator('table').count()) > 0;
		expect(tableExists).toBeTruthy();
	});
});
