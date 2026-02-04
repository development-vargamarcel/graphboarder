import { describe, it, expect } from 'vitest';
import { extractVariables } from './variableExtractor';

describe('extractVariables', () => {
	it('should extract simple scalar variables', () => {
		const query = `
      query GetUser($id: ID, $name: String, $age: Int, $active: Boolean, $score: Float) {
        user(id: $id) {
          name
        }
      }
    `;
		const variables = extractVariables(query);
		expect(variables).toEqual({
			id: '',
			name: '',
			age: 0,
			active: false,
			score: 0.0
		});
	});

	it('should handle NonNull types', () => {
		const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          name
        }
      }
    `;
		const variables = extractVariables(query);
		expect(variables).toEqual({
			id: ''
		});
	});

	it('should handle List types', () => {
		const query = `
      query GetUsers($ids: [ID], $names: [String!]!) {
        users(ids: $ids) {
          name
        }
      }
    `;
		const variables = extractVariables(query);
		expect(variables).toEqual({
			ids: [],
			names: []
		});
	});

	it('should handle unknown types as null', () => {
		const query = `
      mutation CreateUser($input: UserInput) {
        createUser(input: $input) {
          id
        }
      }
    `;
		const variables = extractVariables(query);
		expect(variables).toEqual({
			input: null
		});
	});

	it('should return empty object for query without variables', () => {
		const query = `
      query {
        users {
          name
        }
      }
    `;
		const variables = extractVariables(query);
		expect(variables).toEqual({});
	});

	it('should handle invalid query gracefully', () => {
		const query = `invalid query`;
		const variables = extractVariables(query);
		expect(variables).toEqual({});
	});
});
