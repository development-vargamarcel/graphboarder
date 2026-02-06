import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import GraphqlCodeDisplay from './GraphqlCodeDisplay.svelte';
import { Logger } from '$lib/utils/logger';

// Mock Logger to avoid console noise
vi.spyOn(Logger, 'info').mockImplementation(() => undefined);
vi.spyOn(Logger, 'warn').mockImplementation(() => undefined);
vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
vi.spyOn(Logger, 'debug').mockImplementation(() => undefined);

describe('GraphqlCodeDisplay Minify Feature', () => {
	it('should render the Minify button', () => {
		render(GraphqlCodeDisplay, {
			props: {
				value: 'query { test }',
				showNonPrettifiedQMSBody: false
			}
		});

		const minifyBtn = screen.getByTitle('Minify Query (Remove Whitespace)');
		expect(minifyBtn).toBeTruthy();
	});

	// Note: Testing the actual click and value update is tricky because
	// the value prop is bindable and Svelte 5 testing library support might be limited
	// or specific about how to test bound props updates.
	// However, we can verify that the button is present, which confirms our UI change.

	// Let's try to see if we can check if the value is updated in the UI (CodeEditor).
	// The CodeEditor is complicated, but maybe we can check the non-prettified view.

	it('should minify the query when clicked', async () => {
		const query = `
            query GetUser {
                user(id: 1) {
                    name
                    email
                }
            }
        `;

		const { component } = render(GraphqlCodeDisplay, {
			props: {
				value: query,
				showNonPrettifiedQMSBody: true // Show raw value to check text content easily
			}
		});

		const minifyBtn = screen.getByTitle('Minify Query (Remove Whitespace)');
		await fireEvent.click(minifyBtn);

		// Expectation: The logger should have been called
		expect(Logger.info).toHaveBeenCalledWith('Minifying query...');

		// Check if the displayed text is minified
		// The non-prettified view shows the value in a code block
		const codeBlock = screen.getAllByRole('code')[0]; // First code block is value
		expect(codeBlock.textContent).toContain('query GetUser{user(id:1){name email}}');
	});
});
