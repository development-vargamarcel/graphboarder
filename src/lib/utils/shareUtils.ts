import LZString from 'lz-string';

/**
 * Compresses a query string for use in a URL.
 * @param query - The GraphQL query string.
 * @returns The compressed string.
 */
export const compressQuery = (query: string): string => {
    return LZString.compressToEncodedURIComponent(query);
};

/**
 * Decompresses a query string from a URL.
 * @param compressed - The compressed string.
 * @returns The original query string, or null if decompression fails.
 */
export const decompressQuery = (compressed: string): string | null => {
    return LZString.decompressFromEncodedURIComponent(compressed);
};
