import { expect, test } from '@playwright/test';

test('header has github link', async ({ page }) => {
	await page.goto('/');

	const githubLink = page.locator('header .corner a[href="https://github.com/development-vargamarcel/graphboarder"]');
	await expect(githubLink).toBeVisible();

	const githubIcon = githubLink.locator('img[alt="GitHub"]');
	await expect(githubIcon).toBeVisible();

    // Check that the image has a source (it should be a data URI or a path)
    const src = await githubIcon.getAttribute('src');
    expect(src).toBeTruthy();
});
