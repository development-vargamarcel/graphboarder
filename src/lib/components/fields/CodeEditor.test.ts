import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import CodeEditor from './CodeEditor.svelte';

// Mock dependencies to avoid browser-specific errors
vi.mock('monaco-editor', () => ({
	editor: {
		create: vi.fn(() => ({
			dispose: vi.fn(),
			getValue: vi.fn(() => 'test code'),
			setValue: vi.fn(),
			onDidChangeModelContent: vi.fn()
		}))
	}
}));

// Mock Prettier to avoid plugin errors in test environment
vi.mock('prettier/standalone', () => ({
	format: vi.fn(() => Promise.resolve('formatted code'))
}));

// Mock workers
vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => ({ default: class {} }));
vi.mock('monaco-editor/esm/vs/language/json/json.worker?worker', () => ({ default: class {} }));
vi.mock('monaco-editor/esm/vs/language/css/css.worker?worker', () => ({ default: class {} }));
vi.mock('monaco-editor/esm/vs/language/html/html.worker?worker', () => ({ default: class {} }));
vi.mock('monaco-editor/esm/vs/language/typescript/ts.worker?worker', () => ({
	default: class {}
}));

describe('CodeEditor Component', () => {
	it('should export prettify function', () => {
		const { component } = render(CodeEditor, {
			props: {
				value: 'test',
				language: 'javascript'
			}
		});

		expect(component.prettify).toBeDefined();
		expect(typeof component.prettify).toBe('function');
	});
});
