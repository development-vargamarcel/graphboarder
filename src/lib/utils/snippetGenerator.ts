
/**
 * Generates a code snippet for the given language/client.
 *
 * @param language - The target language/client (e.g., 'javascript-fetch', 'python-requests').
 * @param url - The GraphQL endpoint URL.
 * @param query - The GraphQL query string.
 * @param variables - The variables object.
 * @param headers - The headers object.
 * @returns The generated code snippet.
 */
export const generateSnippet = (
    language: string,
    url: string,
    query: string,
    variables: Record<string, any> = {},
    headers: Record<string, string> = {}
): string => {
    const safeQuery = JSON.stringify(query);
    const safeVariables = JSON.stringify(variables, null, 2);
    const safeHeaders = JSON.stringify({ ...headers, 'Content-Type': 'application/json' }, null, 2);

    switch (language) {
        case 'javascript-fetch':
            return `fetch('${url}', {
  method: 'POST',
  headers: ${safeHeaders},
  body: JSON.stringify({
    query: ${safeQuery},
    variables: ${safeVariables}
  })
})
.then(res => res.json())
.then(result => console.log(result));`;

        case 'javascript-urql':
            return `import { createClient, fetchExchange } from 'urql';

const client = createClient({
  url: '${url}',
  fetchOptions: () => {
    return {
      headers: ${safeHeaders}
    };
  },
  exchanges: [fetchExchange],
});

const query = ${safeQuery};
const variables = ${safeVariables};

const result = await client.query(query, variables).toPromise();
console.log(result);`;

        case 'javascript-apollo':
            return `import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: '${url}',
  cache: new InMemoryCache(),
  headers: ${safeHeaders}
});

client
  .query({
    query: gql\`
${query}
    \`,
    variables: ${safeVariables}
  })
  .then(result => console.log(result));`;

        case 'python-requests':
            // Robustly handle booleans and nulls by parsing JSON in Python
            const pyHeaders = safeHeaders.replace(/'/g, "\\'");
            const pyVariables = safeVariables.replace(/'/g, "\\'");

            return `import requests
import json

url = "${url}"

headers = json.loads('${pyHeaders}')

query = """${query}"""

variables = json.loads('${pyVariables}')

response = requests.post(url, json={'query': query, 'variables': variables}, headers=headers)
print(response.json())`;

        default:
            return `// Language '${language}' not supported yet.`;
    }
};

export const SUPPORTED_LANGUAGES = [
    { value: 'javascript-fetch', label: 'JavaScript (Fetch)' },
    { value: 'javascript-urql', label: 'JavaScript (URQL)' },
    { value: 'javascript-apollo', label: 'JavaScript (Apollo)' },
    { value: 'python-requests', label: 'Python (Requests)' }
];
