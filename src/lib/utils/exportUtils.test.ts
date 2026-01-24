import { describe, it, expect } from 'vitest';
import { convertArrayToCSV } from './exportUtils';

describe('exportUtils', () => {
	describe('convertArrayToCSV', () => {
		it('should convert an array of objects to CSV string', () => {
			const data = [
				{ name: 'John', age: 30, city: 'New York' },
				{ name: 'Jane', age: 25, city: 'San Francisco' }
			];
			const expected = 'name,age,city\nJohn,30,New York\nJane,25,San Francisco';
			expect(convertArrayToCSV(data)).toBe(expected);
		});

		it('should handle nested objects', () => {
			const data = [
				{ name: 'John', address: { city: 'New York', zip: '10001' } },
				{ name: 'Jane', address: { city: 'San Francisco', zip: '94105' } }
			];
			const expected = 'name,address.city,address.zip\nJohn,New York,10001\nJane,San Francisco,94105';
			expect(convertArrayToCSV(data)).toBe(expected);
		});

		it('should handle null and undefined values', () => {
			const data = [
				{ name: 'John', age: null },
				{ name: 'Jane', age: undefined }
			];
			const expected = 'name,age\nJohn,\nJane,';
			expect(convertArrayToCSV(data)).toBe(expected);
		});

		it('should escape values containing commas, quotes, or newlines', () => {
			const data = [
				{ name: 'John, Doe', bio: 'He said "Hello"' },
				{ name: 'Jane\nDoe', bio: 'Line 1\nLine 2' }
			];
			const expected = 'name,bio\n"John, Doe","He said ""Hello"""\n"Jane\nDoe","Line 1\nLine 2"';
			expect(convertArrayToCSV(data)).toBe(expected);
		});

		it('should return empty string for empty array', () => {
			expect(convertArrayToCSV([])).toBe('');
		});
	});
});
