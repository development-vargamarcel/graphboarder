import { describe, it, expect } from 'vitest';
import { calculateComplexity, calculateResponseSize, formatBytes } from './queryAnalyzer';

describe('queryAnalyzer', () => {
	describe('calculateComplexity', () => {
		it('should return 0 complexity for empty query', () => {
			expect(calculateComplexity('')).toEqual({ depth: 0, fieldCount: 0 });
		});

		it('should calculate depth and field count for simple query', () => {
			const query = `
                query {
                    users {
                        id
                        name
                    }
                }
            `;
			// users (depth 1), id (depth 2), name (depth 2)
			// Field count: users, id, name = 3
			expect(calculateComplexity(query)).toEqual({ depth: 2, fieldCount: 3 });
		});

		it('should calculate depth and field count for nested query', () => {
			const query = `
                query {
                    users {
                        posts {
                            title
                            comments {
                                text
                            }
                        }
                    }
                }
            `;
			// users (1) -> posts (2) -> title (3), comments (3) -> text (4)
			// Fields: users, posts, title, comments, text = 5
			expect(calculateComplexity(query)).toEqual({ depth: 4, fieldCount: 5 });
		});
	});

	describe('calculateResponseSize', () => {
		it('should return 0 for undefined', () => {
			expect(calculateResponseSize(undefined)).toBe(0);
		});

		it('should return correct size for object', () => {
			const data = { key: 'value' };
			const json = JSON.stringify(data);
			// {"key":"value"} = 13 bytes
			expect(calculateResponseSize(data)).toBe(json.length);
		});
	});

	describe('formatBytes', () => {
		it('should format bytes correctly', () => {
			expect(formatBytes(0)).toBe('0 Bytes');
			expect(formatBytes(1024)).toBe('1 KB');
			expect(formatBytes(1234)).toBe('1.21 KB');
			expect(formatBytes(1024 * 1024)).toBe('1 MB');
		});
	});
});
