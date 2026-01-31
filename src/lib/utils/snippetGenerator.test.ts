import { generateSnippet } from './snippetGenerator';
import { describe, it, expect } from 'vitest';

describe('snippetGenerator', () => {
    const url = 'https://api.example.com/graphql';
    const query = 'query { users { id name } }';
    const variables = { limit: 10, isActive: true, filter: null };
    const headers = { Authorization: 'Bearer token', 'X-Custom': "It's me" };

    it('generates javascript-fetch snippet', () => {
        const snippet = generateSnippet('javascript-fetch', url, query, variables, headers);
        expect(snippet).toContain("fetch('https://api.example.com/graphql'");
        expect(snippet).toContain("method: 'POST'");
        expect(snippet).toContain('"Authorization": "Bearer token"');
        expect(snippet).toContain('query: "query { users { id name } }"');
    });

    it('generates javascript-urql snippet', () => {
        const snippet = generateSnippet('javascript-urql', url, query, variables, headers);
        expect(snippet).toContain("import { createClient, fetchExchange } from 'urql'");
        expect(snippet).toContain("url: 'https://api.example.com/graphql'");
        expect(snippet).toContain('"Authorization": "Bearer token"');
    });

    it('generates javascript-apollo snippet', () => {
        const snippet = generateSnippet('javascript-apollo', url, query, variables, headers);
        expect(snippet).toContain("import { ApolloClient, InMemoryCache, gql } from '@apollo/client'");
        expect(snippet).toContain("uri: 'https://api.example.com/graphql'");
        expect(snippet).toContain('"Authorization": "Bearer token"');
        // Check for query content within gql tag
        expect(snippet).toContain('users { id name }');
    });

    it('generates python-requests snippet with json.loads for robustness', () => {
        const snippet = generateSnippet('python-requests', url, query, variables, headers);
        expect(snippet).toContain('import requests');
        expect(snippet).toContain('import json');
        expect(snippet).toContain('url = "https://api.example.com/graphql"');

        // Verify json.loads usage
        expect(snippet).toContain("headers = json.loads(");
        expect(snippet).toContain("variables = json.loads(");

        // Verify output contains correct values (checking string content)
        expect(snippet).toContain("Authorization");
        expect(snippet).toContain("Bearer token");
        expect(snippet).toContain("It\\'s me"); // Should be escaped for the python string literal

        expect(snippet).toContain('requests.post(url, json={\'query\': query, \'variables\': variables}, headers=headers)');
    });

    it('returns error message for unsupported language', () => {
        const snippet = generateSnippet('ruby', url, query, variables, headers);
        expect(snippet).toContain("// Language 'ruby' not supported yet.");
    });
});
