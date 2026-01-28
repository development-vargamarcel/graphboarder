import { describe, it, expect } from 'vitest';
import { generateMockData } from './mockGenerator';
import type { SchemaData } from '../types/index';

const mockSchemaData: SchemaData = {
    rootTypes: [
        {
            name: 'Query',
            kind: 'OBJECT',
            fields: [
                {
                    name: 'hello',
                    type: { kind: 'SCALAR', name: 'String' },
                },
                {
                    name: 'user',
                    type: { kind: 'OBJECT', name: 'User' },
                },
                {
                    name: 'users',
                    type: { kind: 'LIST', ofType: { kind: 'OBJECT', name: 'User' } },
                }
            ]
        },
        {
            name: 'User',
            kind: 'OBJECT',
            fields: [
                {
                    name: 'id',
                    type: { kind: 'SCALAR', name: 'ID' },
                },
                {
                    name: 'name',
                    type: { kind: 'SCALAR', name: 'String' },
                },
                {
                    name: 'age',
                    type: { kind: 'SCALAR', name: 'Int' },
                }
            ]
        }
    ] as any,
    queryFields: [],
    mutationFields: [],
    subscriptionFields: []
};

describe('generateMockData', () => {
    it('generates mock data for simple scalar field', () => {
        const query = 'query { hello }';
        const result = generateMockData(query, mockSchemaData);
        expect(result.data).toBeDefined();
        expect(typeof result.data.hello).toBe('string');
        expect(result.data.hello).toContain('MockString_');
    });

    it('generates mock data for nested object', () => {
        const query = 'query { user { id name age } }';
        const result = generateMockData(query, mockSchemaData);
        expect(result.data.user).toBeDefined();
        expect(result.data.user.id).toContain('ID_');
        expect(typeof result.data.user.name).toBe('string');
        expect(typeof result.data.user.age).toBe('number');
    });

    it('generates mock data for list of objects', () => {
        const query = 'query { users { name } }';
        const result = generateMockData(query, mockSchemaData);
        expect(Array.isArray(result.data.users)).toBe(true);
        expect(result.data.users.length).toBe(2);
        expect(result.data.users[0].name).toContain('MockString_');
    });

    it('handles aliases', () => {
        const query = 'query { greeting: hello }';
        const result = generateMockData(query, mockSchemaData);
        expect(result.data.greeting).toBeDefined();
        expect(result.data.hello).toBeUndefined();
    });

    it('handles __typename', () => {
        const query = 'query { user { __typename } }';
        const result = generateMockData(query, mockSchemaData);
        expect(result.data.user.__typename).toBe('User');
    });
});
