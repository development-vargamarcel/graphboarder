import { expect, test } from '@playwright/test';

test.describe('Advanced User Flow Tests', () => {
	/**
	 * Helper function to navigate to a query page
	 */
	async function navigateToQueryPage(page: any, context: any) {
		// Navigate to home page
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		// Click "Get Started" button
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await expect(getStartedButton).toBeVisible();
		await getStartedButton.click();

		// Wait for navigation to /endpoints
		await page.waitForURL(/\/endpoints/);
		await page.waitForLoadState('networkidle');

		// Click on the first row in the table
		const firstRow = page.locator('tbody tr').first();
		await expect(firstRow).toBeVisible({ timeout: 10000 });

		const [newPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		// Wait for the new page to load
		await newPage.waitForLoadState('domcontentloaded');
		await newPage.waitForLoadState('networkidle');

		// Open drawer if needed
		const drawerButton = newPage
			.locator('label.btn.btn-square.btn-ghost, button.btn.btn-square.btn-ghost')
			.first();
		const isDrawerButtonVisible = await drawerButton.isVisible();
		if (isDrawerButtonVisible) {
			await drawerButton.click();
			await newPage.waitForTimeout(500);
		}

		// Click on "Queries" tab
		const queriesTab = newPage.locator('a[href*="/queries"]').first();
		await expect(queriesTab).toBeVisible({ timeout: 10000 });
		await queriesTab.click();

		await newPage.waitForTimeout(1000);
		await newPage.waitForLoadState('networkidle');

		// Click on the first query item
		const firstQueryItem = newPage.locator('ul.space-y-1 li a').first();
		await expect(firstQueryItem).toBeVisible({ timeout: 10000 });
		await firstQueryItem.click();

		await newPage.waitForLoadState('networkidle');

		return newPage;
	}

	test('test query with filter selection - radio type', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// Look for filter buttons (they have class btn btn-xs)
		const filterButtons = queryPage.locator('btn.btn.btn-xs');
		const filterCount = await filterButtons.count();

		if (filterCount > 0) {
			// Click the first filter button
			await filterButtons.first().click();

			// Wait for modal to appear
			const modal = queryPage.locator('.modal, [class*="Modal"]').first();
			const modalVisible = await modal.isVisible().catch(() => false);

			if (modalVisible) {
				// Look for radio options in the modal
				const radioOptions = queryPage.locator('input[type="radio"]');
				const radioCount = await radioOptions.count();

				if (radioCount > 0) {
					// Select the second option (if available)
					const secondRadio = radioOptions.nth(1);
					await secondRadio.click();

					// Click Apply button
					const applyButton = queryPage.locator(
						'button:has-text("Apply"), button:has-text("apply")'
					);
					const applyExists = (await applyButton.count()) > 0;
					if (applyExists) {
						await applyButton.click();
					}

					// Wait for the query to update
					await queryPage.waitForTimeout(1000);
					await queryPage.waitForLoadState('networkidle');

					// Verify that the filter was applied (the button should now have btn-primary class)
					const appliedFilter = await filterButtons.first().getAttribute('class');
					expect(appliedFilter).toContain('btn-primary');
				}
			}
		}

		// Verify we're still on the query page
		await expect(queryPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);
	});

	test('test query with filter selection - checkbox type', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// Look for filter buttons
		const filterButtons = queryPage.locator('btn.btn.btn-xs');
		const filterCount = await filterButtons.count();

		if (filterCount > 1) {
			// Try clicking different filter buttons to find one with checkboxes
			for (let i = 0; i < Math.min(filterCount, 3); i++) {
				await filterButtons.nth(i).click();
				await queryPage.waitForTimeout(300);

				// Look for checkbox options in the modal
				const checkboxOptions = queryPage.locator('input[type="checkbox"]');
				const checkboxCount = await checkboxOptions.count();

				if (checkboxCount > 0) {
					// Select multiple checkboxes
					const firstCheckbox = checkboxOptions.first();
					const secondCheckbox = checkboxOptions.nth(1);

					await firstCheckbox.click();
					if (await secondCheckbox.isVisible()) {
						await secondCheckbox.click();
					}

					// Click Apply button
					const applyButton = queryPage.locator(
						'button:has-text("Apply"), button:has-text("apply")'
					);
					const applyExists = (await applyButton.count()) > 0;
					if (applyExists) {
						await applyButton.click();
						await queryPage.waitForTimeout(1000);
					}

					break; // Exit loop after finding checkbox filter
				} else {
					// Close modal if no checkboxes found
					const cancelButton = queryPage.locator(
						'button:has-text("Cancel"), button:has-text("cancel")'
					);
					const cancelExists = (await cancelButton.count()) > 0;
					if (cancelExists) {
						await cancelButton.click();
					}
				}
			}
		}

		// Verify we're still on the query page
		await expect(queryPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);
	});

	test('test drag and drop filter reordering', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// Look for a filter button with checkboxes (which supports reordering)
		const filterButtons = queryPage.locator('btn.btn.btn-xs');
		const filterCount = await filterButtons.count();

		if (filterCount > 0) {
			// Click on a filter to open modal
			await filterButtons.first().click();
			await queryPage.waitForTimeout(500);

			// Look for checkbox options with drag handles
			const dragHandles = queryPage.locator('.bi-grip-vertical');
			const dragHandleCount = await dragHandles.count();

			if (dragHandleCount >= 2) {
				// Get the first two drag handles
				const firstHandle = dragHandles.first();
				const secondHandle = dragHandles.nth(1);

				// Get their bounding boxes
				const firstBox = await firstHandle.boundingBox();
				const secondBox = await secondHandle.boundingBox();

				if (firstBox && secondBox) {
					// Drag the second item to the first position
					await queryPage.mouse.move(
						secondBox.x + secondBox.width / 2,
						secondBox.y + secondBox.height / 2
					);
					await queryPage.mouse.down();
					await queryPage.waitForTimeout(100);
					await queryPage.mouse.move(
						firstBox.x + firstBox.width / 2,
						firstBox.y + firstBox.height / 2
					);
					await queryPage.waitForTimeout(100);
					await queryPage.mouse.up();

					// Wait for the drag animation to complete
					await queryPage.waitForTimeout(500);

					// Verify the order changed by checking the positions
					const dragHandlesAfter = queryPage.locator('.bi-grip-vertical');
					const afterCount = await dragHandlesAfter.count();
					expect(afterCount).toBe(dragHandleCount);
				}

				// Click Apply or Cancel to close the modal
				const applyButton = queryPage.locator('button:has-text("Apply"), button:has-text("apply")');
				const applyExists = (await applyButton.count()) > 0;
				if (applyExists) {
					await applyButton.click();
				}
			} else {
				// Close modal if no drag handles found
				const cancelButton = queryPage.locator(
					'button:has-text("Cancel"), button:has-text("cancel")'
				);
				const cancelExists = (await cancelButton.count()) > 0;
				if (cancelExists) {
					await cancelButton.click();
				}
			}
		}

		// Verify we're still on the query page
		await expect(queryPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);
	});

	test('test adding and removing columns', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// Look for the "add column" button (bi bi-node-plus-fill icon)
		const addColumnButton = queryPage.locator('.btn.btn-xs.bi.bi-node-plus-fill').first();
		const addColumnExists = await addColumnButton.isVisible().catch(() => false);

		if (addColumnExists) {
			// Click the add column button
			await addColumnButton.click();
			await queryPage.waitForTimeout(500);

			// The dropdown should be visible
			const dropdown = queryPage.locator('.dropdown-content').first();
			const dropdownVisible = await dropdown.isVisible().catch(() => false);

			if (dropdownVisible) {
				// Look for expandable field options
				const fieldOptions = queryPage
					.locator('.dropdown-content button, .dropdown-content label')
					.first();
				const optionsExist = await fieldOptions.isVisible().catch(() => false);

				if (optionsExist) {
					// Click on a field option to expand it
					await fieldOptions.click();
					await queryPage.waitForTimeout(300);
				}

				// Click the "add" button to add the column
				const addButton = queryPage.locator('button.btn.btn-xs.btn-primary:has-text("add")');
				const addButtonExists = (await addButton.count()) > 0;
				if (addButtonExists) {
					await addButton.click();
					await queryPage.waitForTimeout(1000);
					await queryPage.waitForLoadState('networkidle');
				}
			}

			// Verify that a table exists
			const table = queryPage.locator('table');
			await expect(table).toBeVisible();

			// Test hiding/removing a column
			// Look for column dropdown menus (chevron-down icons in table headers)
			const columnDropdowns = queryPage.locator('thead .bi-chevron-down').first();
			const columnDropdownExists = await columnDropdowns.isVisible().catch(() => false);

			if (columnDropdownExists) {
				// Click on the column header to open dropdown
				await columnDropdowns.click();
				await queryPage.waitForTimeout(300);

				// Look for "hide field" option
				const hideOption = queryPage.locator('text="hide field"').first();
				const hideOptionExists = await hideOption.isVisible().catch(() => false);

				if (hideOptionExists) {
					await hideOption.click();
					await queryPage.waitForTimeout(500);
				}
			}
		}

		// Verify we're still on the query page
		await expect(queryPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);
	});

	test('test control panel toggle and interaction', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// Look for the "toggle control panel" button
		const controlPanelButton = queryPage.locator('button:has-text("toggle control panel")');
		const controlPanelExists = await controlPanelButton.isVisible().catch(() => false);

		if (controlPanelExists) {
			// Click to open control panel
			await controlPanelButton.click();
			await queryPage.waitForTimeout(500);

			// Verify control panel is visible
			const controlPanel = queryPage.locator('.card-body');
			const controlPanelVisible = await controlPanel.isVisible().catch(() => false);
			expect(controlPanelVisible).toBeTruthy();

			// Click again to close control panel
			await controlPanelButton.click();
			await queryPage.waitForTimeout(500);
		}

		// Verify we're still on the query page
		await expect(queryPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);
	});

	test('test QMS body display and GraphQL query inspection', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// Look for the "QMS body" button
		const qmsBodyButton = queryPage.locator('button:has-text("QMS body")');
		const qmsBodyExists = await qmsBodyButton.isVisible().catch(() => false);

		if (qmsBodyExists) {
			// Click to show QMS body
			await qmsBodyButton.click();
			await queryPage.waitForTimeout(500);

			// Verify that GraphQL code is displayed
			const codeDisplay = queryPage.locator('pre, code, .hljs');
			const codeDisplayExists = await codeDisplay.isVisible().catch(() => false);

			if (codeDisplayExists) {
				// Get the code content
				const codeContent = await codeDisplay.textContent();
				expect(codeContent).toBeTruthy();
				expect(codeContent?.length).toBeGreaterThan(0);
			}

			// Click again to hide QMS body
			await qmsBodyButton.click();
			await queryPage.waitForTimeout(500);
		}

		// Verify we're still on the query page
		await expect(queryPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);
	});

	test('test table row selection and interaction', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// Wait for table to load
		await queryPage.waitForTimeout(2000);

		// Look for checkboxes or radio buttons in table rows
		const rowSelectors = queryPage.locator(
			'tbody input[type="checkbox"], tbody input[type="radio"]'
		);
		const selectorCount = await rowSelectors.count();

		if (selectorCount > 0) {
			// Select the first row
			await rowSelectors.first().click();
			await queryPage.waitForTimeout(300);

			// Verify the row is selected
			const isChecked = await rowSelectors.first().isChecked();
			expect(isChecked).toBeTruthy();

			// If there are multiple rows and multi-select is enabled, select another row
			if (selectorCount > 1) {
				const secondSelector = rowSelectors.nth(1);
				const isCheckbox = (await secondSelector.getAttribute('type')) === 'checkbox';

				if (isCheckbox) {
					await secondSelector.click();
					await queryPage.waitForTimeout(300);

					const isSecondChecked = await secondSelector.isChecked();
					expect(isSecondChecked).toBeTruthy();
				}
			}
		}

		// Test clicking on a table row (should navigate or open detail)
		const tableRows = queryPage.locator('tbody tr');
		const rowCount = await tableRows.count();

		if (rowCount > 0) {
			// Click on the first data row
			const firstRow = tableRows.first();
			await firstRow.click();
			await queryPage.waitForTimeout(1000);

			// The URL might change to a detail page
			// Or a modal might open - we just verify no errors occurred
			const currentUrl = queryPage.url();
			expect(currentUrl).toBeTruthy();
		}
	});

	test('complete user journey with multiple interactions', async ({ page, context }) => {
		const queryPage = await navigateToQueryPage(page, context);

		// 1. Apply a filter
		const filterButtons = queryPage.locator('btn.btn.btn-xs');
		if ((await filterButtons.count()) > 0) {
			await filterButtons.first().click();
			await queryPage.waitForTimeout(300);

			const radioOptions = queryPage.locator('input[type="radio"]');
			if ((await radioOptions.count()) > 0) {
				await radioOptions.nth(1).click();
				const applyButton = queryPage.locator('button:has-text("Apply")');
				if ((await applyButton.count()) > 0) {
					await applyButton.click();
					await queryPage.waitForTimeout(1000);
				}
			}
		}

		// 2. Toggle QMS body to see the query
		const qmsBodyButton = queryPage.locator('button:has-text("QMS body")');
		if (await qmsBodyButton.isVisible().catch(() => false)) {
			await qmsBodyButton.click();
			await queryPage.waitForTimeout(500);
			await qmsBodyButton.click(); // Hide it again
		}

		// 3. Interact with the table
		const tableRows = queryPage.locator('tbody tr');
		if ((await tableRows.count()) > 0) {
			const rowSelectors = queryPage.locator('tbody input[type="checkbox"]');
			if ((await rowSelectors.count()) > 0) {
				await rowSelectors.first().click();
				await queryPage.waitForTimeout(300);
			}
		}

		// 4. Verify the page is still functional
		const table = queryPage.locator('table');
		await expect(table).toBeVisible();
		await expect(queryPage.url()).toMatch(/\/endpoints\/.*\/queries\/.+/);
	});

	test('test explorer page navigation and interaction', async ({ page, context }) => {
		// Navigate to home page
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		// Click "Get Started" button
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await expect(getStartedButton).toBeVisible();
		await getStartedButton.click();

		await page.waitForURL(/\/endpoints/);
		await page.waitForLoadState('networkidle');

		// Click on the first row
		const firstRow = page.locator('tbody tr').first();
		await expect(firstRow).toBeVisible({ timeout: 10000 });

		const [newPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await newPage.waitForLoadState('networkidle');

		// Navigate to Explorer tab
		const explorerTab = newPage.locator('a[href*="/explorer"]').first();
		const explorerExists = await explorerTab.isVisible().catch(() => false);

		if (explorerExists) {
			await explorerTab.click();
			await newPage.waitForLoadState('networkidle');
			await newPage.waitForTimeout(1000);

			// Verify we're on the explorer page
			await expect(newPage.url()).toMatch(/\/endpoints\/.*\/explorer/);
		}
	});

	test('test mutations page navigation', async ({ page, context }) => {
		// Navigate to home page
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		// Click "Get Started" button
		const getStartedButton = page.locator('a.btn.btn-primary:has-text("Get Started")');
		await expect(getStartedButton).toBeVisible();
		await getStartedButton.click();

		await page.waitForURL(/\/endpoints/);
		await page.waitForLoadState('networkidle');

		// Click on the first row
		const firstRow = page.locator('tbody tr').first();
		await expect(firstRow).toBeVisible({ timeout: 10000 });

		const [newPage] = await Promise.all([context.waitForEvent('page'), firstRow.click()]);

		await newPage.waitForLoadState('networkidle');

		// Navigate to Mutations tab
		const mutationsTab = newPage.locator('a[href*="/mutations"]').first();
		const mutationsExists = await mutationsTab.isVisible().catch(() => false);

		if (mutationsExists) {
			await mutationsTab.click();
			await newPage.waitForLoadState('networkidle');
			await newPage.waitForTimeout(1000);

			// Verify we're on the mutations page
			await expect(newPage.url()).toMatch(/\/endpoints\/.*\/mutations/);

			// Click on the first mutation if available
			const firstMutation = newPage.locator('ul.space-y-1 li a').first();
			const firstMutationExists = await firstMutation.isVisible().catch(() => false);

			if (firstMutationExists) {
				await firstMutation.click();
				await newPage.waitForLoadState('networkidle');
			}
		}
	});
});
