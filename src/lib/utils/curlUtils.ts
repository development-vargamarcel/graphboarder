/**
 * Generates a cURL command string for a GraphQL query.
 *
 * @param url - The endpoint URL.
 * @param query - The GraphQL query string.
 * @param variables - Optional variables object.
 * @param headers - Optional headers object.
 * @returns A formatted cURL command string.
 */
export const generateCurlCommand = (
	url: string,
	query: string,
	variables: Record<string, any> = {},
	headers: Record<string, string> = {}
): string => {
	// Escape single quotes in the data string for shell safety
	const data = JSON.stringify({
		query,
		variables
	}).replace(/'/g, "'\\''");

	let curl = `curl '${url}' \\\n`;
	curl += `  -H 'Content-Type: application/json' \\\n`;

	Object.entries(headers).forEach(([key, value]) => {
		curl += `  -H '${key}: ${value}' \\\n`;
	});

	curl += `  --data-binary '${data}'`;

	return curl;
};
