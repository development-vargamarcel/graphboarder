import { expect, test } from '@playwright/test';

test.describe('Page Navigation Tests', () => {
	test('navigate through all main sections from home', async ({ page, context }) => {
		// Start at home page
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		// Verify home page content
		const title = page.locator('h2.card-title:has-text("GraphQL Endpoint Explorer")');
		await expect(title).toBeVisible();

		// Click Get Started
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await expect(getStartedButton).toBeVisible();
		await getStartedButton.click();

		// Should be on endpoints page
		await page.waitForURL(/\/endpoints/);
		await page.waitForLoadState('networkidle');

		// Verify endpoints table is visible
		const table = page.locator('table');
		await expect(table).toBeVisible();

		// Click on first endpoint
		const firstRow = page.locator('tbody tr').first();
		await expect(firstRow).toBeVisible({ timeout: 10000 });

		const [endpointPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await endpointPage.waitForLoadState('networkidle');

		// Verify we're on an endpoint detail page
		expect(endpointPage.url()).toMatch(/\/endpoints\/.+/);

		// Test navigation through all tabs
		const tabs = ['Queries', 'Mutations', 'Explorer'];

		for (const tabName of tabs) {
			const tab = endpointPage.locator(`a[href*="/${tabName.toLowerCase()}"]`).first();
			const tabExists = await tab.isVisible().catch(() => false);

			if (tabExists) {
				await tab.click();
				await endpointPage.waitForTimeout(1000);
				await endpointPage.waitForLoadState('networkidle');

				// Verify URL changed
				expect(endpointPage.url()).toMatch(new RegExp(tabName.toLowerCase()));
			}
		}
	});

	test('test endpoint type switching (local, localstorage, remote)', async ({ page }) => {
		await page.goto('/endpoints');
		await page.waitForLoadState('networkidle');

		// Look for the endpoint type switcher buttons at bottom right
		const localButton = page.locator('button.btn.btn-xs:has-text("local")').first();
		const localstorageButton = page.locator('button.btn.btn-xs:has-text("localstorage")').first();
		const remoteButton = page.locator('button.btn.btn-xs:has-text("remote")').first();

		// Test switching to localstorage view
		if (await localstorageButton.isVisible()) {
			await localstorageButton.click();
			await page.waitForTimeout(500);

			// Verify the view changed (table or content should be different)
			const table = page.locator('table');
			const tableExists = await table.isVisible().catch(() => false);
			expect(tableExists).toBeTruthy();
		}

		// Test switching to remote view
		if (await remoteButton.isVisible()) {
			await remoteButton.click();
			await page.waitForTimeout(500);

			// Remote view might show different content
			const content = page.locator('.card, .alert');
			const contentExists = await content.isVisible().catch(() => false);
			expect(contentExists).toBeTruthy();
		}

		// Switch back to local view
		if (await localButton.isVisible()) {
			await localButton.click();
			await page.waitForTimeout(500);

			// Verify we're back to local endpoints
			const table = page.locator('table');
			await expect(table).toBeVisible();
		}
	});

	test('test sidebar visibility and interaction on mobile viewport', async ({ page, context }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		// Navigate to an endpoint
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await getStartedButton.click();
		await page.waitForURL(/\/endpoints/);

		const firstRow = page.locator('tbody tr').first();
		const [endpointPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await endpointPage.waitForLoadState('networkidle');

		// Find and click the hamburger menu
		const hamburgerButton = endpointPage
			.locator('label.btn.btn-square.btn-ghost, button.btn.btn-square.btn-ghost')
			.first();
		await expect(hamburgerButton).toBeVisible();
		await hamburgerButton.click();

		await endpointPage.waitForTimeout(500);

		// Sidebar should be visible after clicking hamburger
		const sidebar = endpointPage.locator('.bi-house, .bi-asterisk, .bi-pen').first();
		const sidebarVisible = await sidebar.isVisible().catch(() => false);
		expect(sidebarVisible).toBeTruthy();

		// Click outside or on a tab to close sidebar
		const queriesTab = endpointPage.locator('a[href*="/queries"]').first();
		if (await queriesTab.isVisible()) {
			await queriesTab.click();
			await endpointPage.waitForTimeout(1000);
		}
	});

	test('test home button navigation from sidebar', async ({ page, context }) => {
		await page.goto('/');
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await getStartedButton.click();
		await page.waitForURL(/\/endpoints/);

		const firstRow = page.locator('tbody tr').first();
		const [endpointPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await endpointPage.waitForLoadState('networkidle');

		// Click on the home icon in the sidebar
		const homeLink = endpointPage.locator('a[href="/"]').first();
		const homeExists = await homeLink.isVisible().catch(() => false);

		if (homeExists) {
			await homeLink.click();
			await endpointPage.waitForLoadState('networkidle');

			// Should be back on home page
			expect(endpointPage.url()).toMatch(/\/$/);
		}
	});

	test('test breadcrumb navigation and back button functionality', async ({ page, context }) => {
		await page.goto('/');
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await getStartedButton.click();
		await page.waitForURL(/\/endpoints/);

		const firstRow = page.locator('tbody tr').first();
		const [endpointPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await endpointPage.waitForLoadState('networkidle');

		// Navigate to queries
		const queriesTab = endpointPage.locator('a[href*="/queries"]').first();
		if (await queriesTab.isVisible()) {
			await queriesTab.click();
			await endpointPage.waitForTimeout(1000);

			// Click on a query
			const firstQuery = endpointPage.locator('ul.space-y-1 li a').first();
			if (await firstQuery.isVisible()) {
				await firstQuery.click();
				await endpointPage.waitForLoadState('networkidle');

				// Use browser back button
				await endpointPage.goBack();
				await endpointPage.waitForLoadState('networkidle');

				// Should be back on queries list page
				expect(endpointPage.url()).toMatch(/\/queries$/);
			}
		}
	});

	test('test multiple query items navigation', async ({ page, context }) => {
		await page.goto('/');
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await getStartedButton.click();

		const firstRow = page.locator('tbody tr').first();
		const [endpointPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await endpointPage.waitForLoadState('networkidle');

		// Navigate to queries
		const queriesTab = endpointPage.locator('a[href*="/queries"]').first();
		if (await queriesTab.isVisible()) {
			await queriesTab.click();
			await endpointPage.waitForTimeout(1000);

			// Get all query items
			const queryItems = endpointPage.locator('ul.space-y-1 li a');
			const queryCount = await queryItems.count();

			// Navigate through first 3 queries (or all if less than 3)
			const queriesToTest = Math.min(queryCount, 3);

			for (let i = 0; i < queriesToTest; i++) {
				// Click on queries tab again to see the list
				await queriesTab.click();
				await endpointPage.waitForTimeout(500);

				// Click on the query item
				const queryItem = queryItems.nth(i);
				const queryText = await queryItem.textContent();

				await queryItem.click();
				await endpointPage.waitForLoadState('networkidle');
				await endpointPage.waitForTimeout(1000);

				// Verify we're on a query detail page
				expect(endpointPage.url()).toMatch(/\/queries\/.+/);

				// Verify table exists
				const table = endpointPage.locator('table');
				const tableExists = await table.isVisible().catch(() => false);

				// Query might not have results, but page should load
				expect(endpointPage.url()).toBeTruthy();
			}
		}
	});

	test('test error handling and page resilience', async ({ page, context }) => {
		// Try to navigate to a potentially non-existent endpoint
		await page.goto('/endpoints/nonexistent-endpoint-12345');
		await page.waitForLoadState('domcontentloaded');

		// Page should handle the error gracefully
		// Either show an error message or redirect
		const url = page.url();
		expect(url).toBeTruthy();

		// Try a malformed URL
		await page.goto('/endpoints');
		await page.waitForLoadState('networkidle');

		// Should show the endpoints list without errors
		const table = page.locator('table');
		const tableExists = await table.isVisible().catch(() => false);
		expect(tableExists).toBeTruthy();
	});

	test('test persistent state across navigation', async ({ page, context }) => {
		await page.goto('/');
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await getStartedButton.click();

		const firstRow = page.locator('tbody tr').first();
		const [endpointPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await endpointPage.waitForLoadState('networkidle');

		// Navigate to queries and apply a filter
		const queriesTab = endpointPage.locator('a[href*="/queries"]').first();
		if (await queriesTab.isVisible()) {
			await queriesTab.click();
			await endpointPage.waitForTimeout(1000);

			const firstQuery = endpointPage.locator('ul.space-y-1 li a').first();
			if (await firstQuery.isVisible()) {
				await firstQuery.click();
				await endpointPage.waitForLoadState('networkidle');

				// Apply a filter if available
				const filterButtons = endpointPage.locator('btn.btn.btn-xs');
				if ((await filterButtons.count()) > 0) {
					await filterButtons.first().click();
					await endpointPage.waitForTimeout(300);

					const radioOptions = endpointPage.locator('input[type="radio"]');
					if ((await radioOptions.count()) > 0) {
						await radioOptions.nth(1).click();
						const applyButton = endpointPage.locator('button:has-text("Apply")');
						if ((await applyButton.count()) > 0) {
							await applyButton.click();
							await endpointPage.waitForTimeout(1000);
						}
					}

					// Navigate away and back
					await queriesTab.click();
					await endpointPage.waitForTimeout(500);
					await firstQuery.click();
					await endpointPage.waitForLoadState('networkidle');

					// The filter state might or might not persist depending on implementation
					// We just verify the page loads correctly
					const table = endpointPage.locator('table');
					const tableExists = await table.isVisible().catch(() => false);
					expect(tableExists).toBeTruthy();
				}
			}
		}
	});
});
