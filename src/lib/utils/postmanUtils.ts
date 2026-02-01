import { Logger } from '$lib/utils/logger';

/**
 * Generates a Postman Collection v2.1 JSON structure for a given GraphQL query.
 *
 * @param name - The name of the collection (or request).
 * @param url - The endpoint URL.
 * @param query - The GraphQL query string.
 * @param headers - Optional HTTP headers.
 * @param variables - Optional GraphQL variables.
 * @returns A JSON string representing the Postman Collection.
 */
export const generatePostmanCollectionForQuery = (
	name: string,
	url: string,
	query: string,
	headers: Record<string, string> = {},
	variables: Record<string, any> = {}
): string => {
	Logger.debug('Generating Postman Collection', { name, url });

	const collectionId =
		typeof crypto !== 'undefined' && crypto.randomUUID
			? crypto.randomUUID()
			: `col-${Math.random().toString(36).substring(2)}`;

	const headerArray = Object.entries(headers).map(([key, value]) => ({
		key,
		value,
		type: 'text'
	}));

	// Ensure Content-Type is present
	if (
		!headers['Content-Type'] &&
		!Object.keys(headers).find((k) => k.toLowerCase() === 'content-type')
	) {
		headerArray.push({
			key: 'Content-Type',
			value: 'application/json',
			type: 'text'
		});
	}

	// Basic URL parsing to fit Postman schema better, though 'raw' handles most cases
	const protocol = url.startsWith('https') ? 'https' : 'http';
	const urlBody = url.split('://')[1] || url;
	const parts = urlBody.split('/');
	const host = parts[0].split('.');
	const path = parts.slice(1);

	const collection = {
		info: {
			_postman_id: collectionId,
			name: name || 'GraphQL Query Export',
			schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
		},
		item: [
			{
				name: name || 'GraphQL Request',
				request: {
					method: 'POST',
					header: headerArray,
					body: {
						mode: 'graphql',
						graphql: {
							query: query,
							variables: JSON.stringify(variables)
						}
					},
					url: {
						raw: url,
						protocol,
						host,
						path
					}
				},
				response: []
			}
		]
	};

	return JSON.stringify(collection, null, 2);
};
