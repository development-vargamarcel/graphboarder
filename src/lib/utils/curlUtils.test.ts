import { describe, it, expect } from 'vitest';
import { generateCurlCommand } from './curlUtils';

describe('generateCurlCommand', () => {
	it('should generate a basic curl command', () => {
		const url = 'https://api.example.com/graphql';
		const query = '{ users { id name } }';
		const curl = generateCurlCommand(url, query);

		expect(curl).toContain("curl 'https://api.example.com/graphql'");
		expect(curl).toContain("-H 'Content-Type: application/json'");
		expect(curl).toContain('--data-binary');
		expect(curl).toContain('users { id name }');
	});

	it('should include headers', () => {
		const url = 'https://api.example.com/graphql';
		const query = '{ me }';
		const headers = { Authorization: 'Bearer 123', 'X-Custom': 'foo' };
		const curl = generateCurlCommand(url, query, {}, headers);

		expect(curl).toContain("-H 'Authorization: Bearer 123'");
		expect(curl).toContain("-H 'X-Custom: foo'");
	});

	it('should handle variables', () => {
		const url = 'https://api.example.com/graphql';
		const query = 'query($id: ID!) { user(id: $id) { name } }';
		const variables = { id: '123' };
		const curl = generateCurlCommand(url, query, variables);

		expect(curl).toContain('"variables":{"id":"123"}');
	});
});
