
import { describe, it, expect } from 'vitest';
import { getDeepField } from './usefulFunctions';
import type { SchemaData } from '$lib/types';

// Mock SchemaData
const mockSchemaData: SchemaData = {
    rootTypes: [
        {
            name: 'RootQuery',
            kind: 'OBJECT',
            fields: [
                {
                    name: 'user',
                    dd_displayName: 'user',
                    dd_rootName: 'User',
                    type: { kind: 'OBJECT', name: 'User' },
                    dd_kindsArray: ['OBJECT'],
                    dd_namesArray: ['User'],
                    dd_relatedRoot: 'User', // Simplified for mock
                } as any
            ]
        } as any,
        {
            name: 'User',
            kind: 'OBJECT',
            fields: [
                {
                    name: 'address',
                    dd_displayName: 'address',
                    dd_rootName: 'Address',
                    type: { kind: 'OBJECT', name: 'Address' },
                    dd_kindsArray: ['OBJECT'],
                    dd_namesArray: ['Address'],
                    dd_relatedRoot: 'Address',
                } as any,
                 {
                    name: 'name',
                    dd_displayName: 'name',
                    dd_rootName: 'String',
                    type: { kind: 'SCALAR', name: 'String' },
                    dd_kindsArray: ['SCALAR'],
                    dd_namesArray: ['String'],
                    dd_relatedRoot: 'String',
                } as any,
                {
                    name: 'bestFriend',
                    dd_displayName: 'bestFriend',
                    dd_rootName: 'User', // Recursive
                    type: { kind: 'OBJECT', name: 'User' },
                    dd_kindsArray: ['OBJECT'],
                    dd_namesArray: ['User'],
                    dd_relatedRoot: 'User',
                } as any,
                // Field with same name as parent type (if parent was named 'userField' for example)
                // But here parent is 'User'. Field name 'user'
                {
                    name: 'user',
                    dd_displayName: 'user',
                    dd_rootName: 'User',
                    type: { kind: 'OBJECT', name: 'User' },
                    dd_kindsArray: ['OBJECT'],
                    dd_namesArray: ['User'],
                    dd_relatedRoot: 'User',
                } as any
            ]
        } as any,
        {
            name: 'Address',
            kind: 'OBJECT',
            fields: [
                {
                    name: 'street',
                    dd_displayName: 'street',
                    dd_rootName: 'String',
                    type: { kind: 'SCALAR', name: 'String' },
                    dd_kindsArray: ['SCALAR'],
                    dd_namesArray: ['String'],
                    dd_relatedRoot: 'String',
                } as any
            ]
        } as any
    ],
    queryFields: [],
    mutationFields: [],
    subscriptionFields: [],
    get_rootType: (rootTypes, rootTypeName, schemaData) => {
        return schemaData.rootTypes.find(t => t.name === rootTypeName);
    },
    get_QMS_Field: (qmsName, qmsType, schemaData) => undefined
};

describe('getDeepField', () => {
    it('should retrieve a deep field correctly', () => {
        const rootField = mockSchemaData.rootTypes[0].fields![0]; // user
        const result = getDeepField(rootField, ['address', 'street'], mockSchemaData);
        expect(result).toBeDefined();
        expect(result?.dd_displayName).toBe('street');
    });

    it('should return null if path is invalid', () => {
        const rootField = mockSchemaData.rootTypes[0].fields![0]; // user
        const result = getDeepField(rootField, ['address', 'nonExistent'], mockSchemaData);
        expect(result).toBeNull();
    });

    it('should return the object itself if path is empty', () => {
        const rootField = mockSchemaData.rootTypes[0].fields![0]; // user
        const result = getDeepField(rootField, [], mockSchemaData);
        expect(result).toBe(rootField);
    });

    it('should handle recursive fields correctly', () => {
        const rootField = mockSchemaData.rootTypes[0].fields![0]; // user
        // user.bestFriend.name
        const result = getDeepField(rootField, ['bestFriend', 'name'], mockSchemaData);
        expect(result).toBeDefined();
        expect(result?.dd_displayName).toBe('name');
    });

    it('should correctly distinguish between parent object and child field with same name (collision case)', () => {
        const rootField = mockSchemaData.rootTypes[0].fields![0]; // user
        // User type has a field named 'user'.
        // getDeepField(user, ['user']) should return the child field 'user', NOT the parent 'user' object.

        const result = getDeepField(rootField, ['user'], mockSchemaData);
        expect(result).toBeDefined();
        expect(result?.dd_displayName).toBe('user');
        expect(result).not.toBe(rootField); // Should be the child field

        // Verify it is indeed the child field by checking properties if possible, or just knowing it's a different object reference
        // In our mock, they are different objects (one is in rootTypes[0].fields, one in rootTypes[1].fields)
        const childUserField = mockSchemaData.rootTypes[1].fields!.find(f => f.name === 'user');
        expect(result).toBe(childUserField);
    });

    it('should return null if child field with same name does not exist', () => {
         const addressField = mockSchemaData.rootTypes[1].fields![0]; // address
         // Address does not have a field 'address'
         const result = getDeepField(addressField, ['address'], mockSchemaData);
         expect(result).toBeNull();
    });
});
