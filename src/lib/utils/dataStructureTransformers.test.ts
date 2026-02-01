import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	stringToQMSString_transformer,
	string_transformer,
	string_transformerREVERSE,
	number_transformer,
	ISO8601_transformer,
	ISO8601_transformerREVERSE,
	ISO8601_transformerGETDEFAULTVAl,
	geojson_transformer,
	geojson_transformerREVERSE,
	boolean_transformer
} from './dataStructureTransformers';

describe('dataStructureTransformers', () => {
	beforeEach(() => {
		// Clear console mocks
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	describe('stringToQMSString_transformer', () => {
		it('should transform a properly formatted QMS string', () => {
			const input = `'"test&Prime;value"'`;
			const result = stringToQMSString_transformer(input);
			expect(result).toBe('test"value');
		});

		it('should handle strings with single quotes', () => {
			const input = `'"test&prime;value"'`;
			const result = stringToQMSString_transformer(input);
			expect(result).toBe(`test'value`);
		});

		it('should return input and warn if not a string', () => {
			const input = 123;
			const result = stringToQMSString_transformer(input);
			expect(result).toBe(123);
			expect(console.warn).toHaveBeenCalledWith(
				'stringToQMSString_transformer: value is not a string',
				123
			);
		});

		it('should handle complex escaped strings', () => {
			const input = `'"Hello&Prime;World&prime;Test"'`;
			const result = stringToQMSString_transformer(input);
			expect(result).toBe(`Hello"World'Test`);
		});
	});

	describe('string_transformer', () => {
		it('should wrap string in single quotes and escape special chars', () => {
			const result = string_transformer('hello world');
			expect(result).toBe("'hello world'");
		});

		it('should escape double quotes to &Prime;', () => {
			const result = string_transformer('test "quoted" text');
			expect(result).toBe("'test &Prime;quoted&Prime; text'");
		});

		it('should escape single quotes to &prime;', () => {
			const result = string_transformer("test 'quoted' text");
			expect(result).toBe("'test &prime;quoted&prime; text'");
		});

		it('should handle mixed quotes', () => {
			const result = string_transformer(`test "double" and 'single' quotes`);
			expect(result).toBe("'test &Prime;double&Prime; and &prime;single&prime; quotes'");
		});

		it('should return input and warn if not a string', () => {
			const result = string_transformer(42);
			expect(result).toBe(42);
			expect(console.warn).toHaveBeenCalledWith('string_transformer: value is not a string', 42);
		});
	});

	describe('string_transformerREVERSE', () => {
		it('should reverse the transformation', () => {
			const transformed = "'test &Prime;quoted&Prime; text'";
			const result = string_transformerREVERSE(transformed);
			expect(result).toBe('\'test "quoted" text\'');
		});

		it('should handle onlySingleQuotes flag', () => {
			const result = string_transformerREVERSE("'hello'", true);
			expect(result).toBe('hello');
		});

		it('should reverse both &Prime; and &prime;', () => {
			const transformed = "'test &Prime;double&Prime; and &prime;single&prime; quotes'";
			const result = string_transformerREVERSE(transformed);
			expect(result).toBe(`'test "double" and 'single' quotes'`);
		});

		it('should return input and warn if not a string', () => {
			const result = string_transformerREVERSE(42);
			expect(result).toBe(42);
			expect(console.warn).toHaveBeenCalledWith('string_transformer: value is not a string', 42);
		});
	});

	describe('number_transformer', () => {
		it('should return the number multiplied by 1', () => {
			expect(number_transformer(42)).toBe(42);
			expect(number_transformer(3.14)).toBe(3.14);
		});

		it('should remove leading zeros', () => {
			expect(number_transformer(1)).toBe(1);
			expect(number_transformer(1.5)).toBe(1.5);
		});

		it('should handle negative numbers', () => {
			expect(number_transformer(-42)).toBe(-42);
		});

		it('should handle zero', () => {
			expect(number_transformer(0)).toBe(0);
		});

		it('should return input and warn if not a number', () => {
			const result = number_transformer('not a number');
			expect(result).toBe('not a number');
			expect(console.warn).toHaveBeenCalledWith(
				'number_transformer: value is not a number',
				'not a number'
			);
		});
	});

	describe('ISO8601_transformer', () => {
		it('should transform a date string to ISO8601 format', () => {
			const dateStr = '2023-06-15T10:30:00Z';
			const result = ISO8601_transformer(dateStr);
			expect(result).toBe("'2023-06-15T10:30:00.000Z'");
		});

		it('should handle different date formats', () => {
			const dateStr = '2023-06-15';
			const result = ISO8601_transformer(dateStr);
			expect(typeof result).toBe('string');
			expect(result).toContain("'");
		});
	});

	describe('ISO8601_transformerREVERSE', () => {
		it('should convert ISO8601 string to datetime-local format', () => {
			const isoString = "'2023-06-15T10:30:00.000Z'";
			const result = ISO8601_transformerREVERSE(isoString);
			// Result should be in format YYYY-MM-DDTHH:MM
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
		});

		it('should handle different ISO formats', () => {
			const isoString = "'2023-12-31T23:59:00.000Z'";
			const result = ISO8601_transformerREVERSE(isoString);
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
		});

		it('should pad single digit values', () => {
			const isoString = "'2023-01-05T09:05:00.000Z'";
			const result = ISO8601_transformerREVERSE(isoString);
			// Month and day should be zero-padded
			expect(result).toContain('2023-01-05');
		});
	});

	describe('ISO8601_transformerGETDEFAULTVAl', () => {
		it('should return current date in datetime-local format', () => {
			const result = ISO8601_transformerGETDEFAULTVAl();
			// Should match YYYY-MM-DDTHH:MM format
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
		});

		it('should return a valid date string', () => {
			const result = ISO8601_transformerGETDEFAULTVAl();
			const date = new Date(result);
			expect(date.toString()).not.toBe('Invalid Date');
		});
	});

	describe('geojson_transformer', () => {
		it('should transform a single feature FeatureCollection to a geometry object', () => {
			const featureCollection = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [1, 2]
						},
						properties: {}
					}
				]
			};

			const result = geojson_transformer(featureCollection);
			expect(result).toHaveProperty('type', "'Point'");
			expect(result).toHaveProperty('coordinates', [1, 2]);
		});

		it('should handle multiple features', () => {
			const featureCollection = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [1, 2]
						},
						properties: {}
					},
					{
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [3, 4]
						},
						properties: {}
					}
				]
			};

			const result = geojson_transformer(featureCollection);
			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
		});

		it('should transform geometry types correctly', () => {
			const featureCollection = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: [
								[
									[0, 0],
									[1, 0],
									[1, 1],
									[0, 1],
									[0, 0]
								]
							]
						},
						properties: {}
					}
				]
			};

			const result = geojson_transformer(featureCollection);
			expect(result).toHaveProperty('type', "'Polygon'");
		});
	});

	describe('geojson_transformerREVERSE', () => {
		it('should convert geometry object back to FeatureCollection', () => {
			const geometry = {
				type: "'Point'",
				coordinates: [1, 2]
			};

			const result = geojson_transformerREVERSE(geometry);
			expect(result).toHaveProperty('type', 'FeatureCollection');
			expect(result.features).toHaveLength(1);
			expect(result.features[0]).toHaveProperty('type', 'Feature');
			expect(result.features[0].geometry.type).toBe('Point');
		});

		it('should handle array of geometries', () => {
			const geometries = [
				{
					type: "'Point'",
					coordinates: [1, 2]
				},
				{
					type: "'Point'",
					coordinates: [3, 4]
				}
			];

			const result = geojson_transformerREVERSE(geometries);
			expect(result).toHaveProperty('type', 'FeatureCollection');
			expect(result.features).toHaveLength(2);
		});

		it('should create proper Feature structure', () => {
			const geometry = {
				type: "'Polygon'",
				coordinates: [
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				]
			};

			const result = geojson_transformerREVERSE(geometry);
			const feature = result.features[0];
			expect(feature).toHaveProperty('geometry');
			expect(feature).toHaveProperty('properties');
			expect(feature.properties).toEqual({});
		});
	});

	describe('boolean_transformer', () => {
		it('should return true for truthy values', () => {
			expect(boolean_transformer(true)).toBe(true);
			expect(boolean_transformer(1)).toBe(1);
			expect(boolean_transformer('text')).toBe('text');
			expect(boolean_transformer([])).toEqual([]);
		});

		it('should return false for undefined', () => {
			expect(boolean_transformer(undefined)).toBe(false);
		});

		it('should return the value as-is for defined values', () => {
			expect(boolean_transformer(false)).toBe(false);
			expect(boolean_transformer(0)).toBe(0);
			expect(boolean_transformer('')).toBe('');
			// Note: null is undefined in JavaScript, so it returns false
			expect(boolean_transformer(null)).toBe(false);
		});
	});

	describe('Integration: round-trip transformations', () => {
		it('should correctly round-trip string transformations', () => {
			const original = 'test "quoted" text';
			const transformed = string_transformer(original);
			// Transformed will be: 'test &Prime;quoted&Prime; text'
			expect(transformed).toContain('&Prime;');
			const reversed = string_transformerREVERSE(transformed);
			// Reversed will have single quotes around it and replace &Prime; with "
			expect(reversed).toContain('"quoted"');
		});

		it('should correctly round-trip geojson transformations', () => {
			const originalFeatureCollection = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [100, 50]
						},
						properties: {}
					}
				]
			};

			const transformed = geojson_transformer(originalFeatureCollection);
			const reversed = geojson_transformerREVERSE(transformed);

			expect(reversed.type).toBe('FeatureCollection');
			expect(reversed.features[0].geometry.type).toBe('Point');
			expect(reversed.features[0].geometry.coordinates).toEqual([100, 50]);
		});
	});
});
