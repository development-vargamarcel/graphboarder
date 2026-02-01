import { describe, it, expect } from 'vitest';
import { generatePostmanCollectionForQuery } from './postmanUtils';

describe('postmanUtils', () => {
	it('should generate a valid Postman collection JSON', () => {
		const name = 'Test Query';
		const url = 'https://example.com/graphql';
		const query = 'query { test }';
		const headers = { Authorization: 'Bearer token' };
		const variables = { var: 'val' };

		const json = generatePostmanCollectionForQuery(name, url, query, headers, variables);
		const collection = JSON.parse(json);

		expect(collection.info.name).toBe(name);
		expect(collection.item).toHaveLength(1);
		const item = collection.item[0];
		expect(item.name).toBe(name);
		expect(item.request.method).toBe('POST');
		expect(item.request.url.raw).toBe(url);
		expect(item.request.body.mode).toBe('graphql');
		expect(item.request.body.graphql.query).toBe(query);
		expect(item.request.body.graphql.variables).toBe(JSON.stringify(variables));

		const headerKeys = item.request.header.map((h: any) => h.key);
		expect(headerKeys).toContain('Authorization');
		expect(headerKeys).toContain('Content-Type');
	});

	it('should add Content-Type header if missing', () => {
		const json = generatePostmanCollectionForQuery('Test', 'http://test.com', 'query {}');
		const collection = JSON.parse(json);
		const headers = collection.item[0].request.header;
		expect(
			headers.some((h: any) => h.key === 'Content-Type' && h.value === 'application/json')
		).toBe(true);
	});
});
