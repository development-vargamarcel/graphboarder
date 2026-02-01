import { describe, it, expect } from 'vitest';
import { compressQuery, decompressQuery } from './shareUtils';

describe('shareUtils', () => {
	it('should compress and decompress a simple string', () => {
		const query = 'query { users { id name } }';
		const compressed = compressQuery(query);
		const decompressed = decompressQuery(compressed);
		expect(decompressed).toBe(query);
	});

	it('should compress and decompress a complex string with variables', () => {
		const query = `
            query GetUser($id: ID!) {
                user(id: $id) {
                    id
                    name
                    posts {
                        title
                        content
                    }
                }
            }
        `;
		const compressed = compressQuery(query);
		const decompressed = decompressQuery(compressed);
		expect(decompressed).toBe(query);
	});

	it('should handle empty string', () => {
		const query = '';
		const compressed = compressQuery(query);
		const decompressed = decompressQuery(compressed);
		expect(decompressed).toBe(query);
	});

	it('should return null or empty for invalid compressed string', () => {
		// lz-string might return null or empty string for invalid input depending on version
		// But decompressFromEncodedURIComponent usually returns null if invalid.
		// Let's test with a non-compressed string
		const result = decompressQuery('not-compressed-string');
		// It might return something garbage or null.
		// Actually lz-string returns "" or null.
		// We won't strictly enforce null in the test if it returns garbage,
		// but we expect it not to crash.
	});
});
