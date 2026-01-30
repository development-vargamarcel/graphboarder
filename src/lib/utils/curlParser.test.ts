import { describe, it, expect } from 'vitest';
import { parseCurlCommand } from './curlParser';

describe('curlParser', () => {
    it('should parse a simple chrome curl command', () => {
        const curl = `curl 'http://localhost:3000/graphql' \
  -H 'Accept: */*' \
  -H 'Content-Type: application/json' \
  --data-binary '{"query":"query { users { id name } }","variables":{}}'`;

        const result = parseCurlCommand(curl);

        expect(result.url).toBe('http://localhost:3000/graphql');
        expect(result.headers['Content-Type']).toBe('application/json');
        expect(result.headers['Accept']).toBe('*/*');
        expect(result.query).toBe('query { users { id name } }');
        expect(result.variables).toEqual({});
    });

    it('should handle single quotes inside JSON', () => {
        // Chrome escapes ' as '\'' inside single-quoted strings
        // e.g. {"key": "val'ue"} becomes '{"key": "val'\''ue"}'
        const curl = `curl 'http://localhost' --data-binary '{"query":"query { user(name: \\"O'\\''Neil\\") { id } }"}'`;

        // Wait, JSON string would be: {"query":"query { user(name: \"O'Neil\") { id } }"}
        // Escaped for shell: '{"query":"query { user(name: \\"O'\''Neil\\") { id } }"}'

        // Let's try to construct it manually as a string
        const json = JSON.stringify({ query: 'query { user(name: "O\'Neil") { id } }' });
        // json is {"query":"query { user(name: \"O'Neil\") { id } }"}

        // In shell single quotes:
        const shellData = "'" + json.replace(/'/g, "'\\''") + "'";
        const curl2 = `curl 'http://localhost' --data-binary ${shellData}`;

        const result = parseCurlCommand(curl2);
        expect(result.query).toBe('query { user(name: "O\'Neil") { id } }');
    });

    it('should handle newlines in the command', () => {
        const curl = `curl 'http://test.com' \n -H 'A: B'`;
        const result = parseCurlCommand(curl);
        expect(result.url).toBe('http://test.com');
        expect(result.headers['A']).toBe('B');
    });

    it('should handle different data flags', () => {
        const curl = `curl 'http://test.com' --data '{"query":"foo"}'`;
        const result = parseCurlCommand(curl);
        expect(result.query).toBe('foo');
    });
});
