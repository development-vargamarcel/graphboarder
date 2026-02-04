import { describe, it, expect } from 'vitest';
import { substituteVariables } from './variableSubstitutor';

describe('substituteVariables', () => {
	it('should substitute variables', () => {
		const text = 'Bearer {{token}}';
		const vars = { token: '123' };
		expect(substituteVariables(text, vars)).toBe('Bearer 123');
	});

	it('should handle multiple variables', () => {
		const text = '{{key}}={{value}}';
		const vars = { key: 'foo', value: 'bar' };
		expect(substituteVariables(text, vars)).toBe('foo=bar');
	});

	it('should ignore unknown variables', () => {
		const text = 'Bearer {{token}}';
		const vars = {};
		expect(substituteVariables(text, vars)).toBe('Bearer {{token}}');
	});

	it('should handle whitespace in keys', () => {
		const text = '{{ token }}';
		const vars = { token: '123' };
		expect(substituteVariables(text, vars)).toBe('123');
	});

	it('should return original text if null/empty', () => {
		expect(substituteVariables('', {})).toBe('');
		// @ts-ignore
		expect(substituteVariables(null, {})).toBe(null);
	});
});
