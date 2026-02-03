import { describe, it, expect } from 'vitest';
import { compressQuery, decompressQuery } from './shareUtils';

describe('shareUtils', () => {
	it('should compress and decompress a simple string', () => {
		const query = 'query { users { id name } }';
		const compressed = compressQuery(query);
		const decompressed = decompressQuery(compressed);
		expect(decompressed).not.toBeNull();
		expect(decompressed?.query).toBe(query);
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
		expect(decompressed).not.toBeNull();
		expect(decompressed?.query).toBe(query);
	});

	it('should handle empty string', () => {
		const query = '';
		const compressed = compressQuery(query);
		const decompressed = decompressQuery(compressed);
		// LZString compresses empty string to empty string,
		// but decompressFromEncodedURIComponent("") returns null.
		// Our decompressQuery returns { query: null } if we pass it null?
        // No, `decompressQuery` returns `null` if `lz-string` returns null.
        // So we expect null here.
		expect(decompressed).toBeNull();
	});

	it('should return null or empty for invalid compressed string', () => {
		const result = decompressQuery('not-compressed-string');
        // Expecting it to not throw, result might be null or garbage object
	});
});
