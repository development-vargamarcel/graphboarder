import LZString from 'lz-string';

export interface ShareData {
	query: string;
	variables?: Record<string, any>;
}

/**
 * Compresses a query string (and optional variables) for use in a URL.
 * @param query - The GraphQL query string.
 * @param variables - Optional variables object.
 * @returns The compressed string.
 */
export const compressQuery = (query: string, variables?: Record<string, any>): string => {
	if (variables && Object.keys(variables).length > 0) {
		const data: ShareData = { query, variables };
		return LZString.compressToEncodedURIComponent(JSON.stringify(data));
	}
	return LZString.compressToEncodedURIComponent(query);
};

/**
 * Decompresses a query string from a URL.
 * @param compressed - The compressed string.
 * @returns The original query data (query + variables), or null if decompression fails.
 */
export const decompressQuery = (compressed: string): ShareData | null => {
	const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
	if (!decompressed) return null;

	try {
		// Try parsing as JSON first to see if it's the new format
		if (decompressed.trim().startsWith('{')) {
			const data = JSON.parse(decompressed);
			// Check if it matches ShareData structure
			if (data && typeof data === 'object' && 'query' in data) {
				return data as ShareData;
			}
		}
	} catch (e) {
		// Not a JSON object or not our format, fall back to treating as raw query string
	}

	// Fallback: treat as raw query string (legacy support)
	return { query: decompressed };
};
