import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import Description from './Description.svelte';

// Mock the usefulFunctions module
vi.mock('$lib/utils/usefulFunctions', () => ({
	getRootType: vi.fn((_, rootName, schemaData) => {
		if (rootName === 'User') {
			return {
				name: 'User',
				description: 'A user in the system'
			};
		}
		return null;
	})
}));

const createMockContext = (schemaData = {}) => {
	return {
		schemaData: writable(schemaData)
	};
};

describe('Description Component', () => {
	describe('Rendering with Descriptions', () => {
		it('should render alert when nodeRootType has description', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const alert = container.querySelector('.alert');
			expect(alert).toBeTruthy();
		});

		it('should display nodeRootType description', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			expect(container.textContent).toContain('A user in the system');
		});

		it('should display QMSInfo description', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: {
						dd_rootName: 'Unknown',
						description: 'Custom query description'
					}
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			expect(container.textContent).toContain('Custom query description');
		});

		it('should display both descriptions when available', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: {
						dd_rootName: 'User',
						description: 'Additional info'
					}
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			expect(container.textContent).toContain('A user in the system');
			expect(container.textContent).toContain('Additional info');
		});
	});

	describe('Not Rendering', () => {
		it('should not render when no descriptions are available', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'Unknown' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const alert = container.querySelector('.alert');
			expect(alert).toBeFalsy();
		});

		it('should not render when both descriptions are empty', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'Unknown', description: '' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const alert = container.querySelector('.alert');
			expect(alert).toBeFalsy();
		});
	});

	describe('Alert Styling', () => {
		it('should have alert-info class', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const alert = container.querySelector('.alert');
			expect(alert?.classList.contains('alert-info')).toBe(true);
		});

		it('should have shadow-lg class', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const alert = container.querySelector('.alert');
			expect(alert?.classList.contains('shadow-lg')).toBe(true);
		});

		it('should render info icon SVG', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const svg = container.querySelector('svg');
			expect(svg).toBeTruthy();
			expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
		});
	});

	describe('List Structure', () => {
		it('should render descriptions in a list', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: {
						dd_rootName: 'User',
						description: 'Additional info'
					}
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const list = container.querySelector('ul');
			expect(list).toBeTruthy();
			expect(list?.classList.contains('space-y-2')).toBe(true);
		});

		it('should render list items for descriptions', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: {
						dd_rootName: 'User',
						description: 'Additional info'
					}
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const listItems = container.querySelectorAll('li');
			expect(listItems.length).toBe(2);
		});

		it('should render single list item when only one description', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const listItems = container.querySelectorAll('li');
			expect(listItems.length).toBe(1);
		});
	});

	describe('Props', () => {
		it('should accept setNotInUseIfNotValid prop without errors', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' },
					setNotInUseIfNotValid: false
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			expect(container).toBeTruthy();
		});

		it('should accept setNotInUseIfNotValidAndENUM prop without errors', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' },
					setNotInUseIfNotValidAndENUM: false
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			expect(container).toBeTruthy();
		});

		it('should accept custom prefix prop without errors', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User' },
					prefix: 'custom-'
				},
				context: new Map([['custom-QMSMainWraperContext', createMockContext()]])
			});

			expect(container).toBeTruthy();
		});
	});

	describe('Edge Cases', () => {
		it('should handle undefined QMSInfo description', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User', description: undefined }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const alert = container.querySelector('.alert');
			expect(alert).toBeTruthy();
		});

		it('should handle null QMSInfo description', () => {
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: { dd_rootName: 'User', description: null }
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			const alert = container.querySelector('.alert');
			expect(alert).toBeTruthy();
		});

		it('should handle very long descriptions', () => {
			const longDescription = 'A'.repeat(1000);
			const { container } = render(Description, {
				props: {
					node: {},
					parentNode: {},
					QMSInfo: {
						dd_rootName: 'Unknown',
						description: longDescription
					}
				},
				context: new Map([['QMSMainWraperContext', createMockContext()]])
			});

			expect(container.textContent).toContain(longDescription);
		});
	});
});
