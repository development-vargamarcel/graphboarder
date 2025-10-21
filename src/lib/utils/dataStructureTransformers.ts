import { getPreciseType } from "./usefulFunctions";

//In the future use terms like processString_transformer and unprocessString_transformer,and also use chd_processedValue and chd_unprocessedValue instead of chd_rawValue and chd_dispatchValue
export const stringToQMSString_transformer = (value: unknown): string | unknown => {
	//the input value is the result of a stringified QMS object, so we need to parse it
	if (getPreciseType(value) !== 'string') {
		console.warn('stringToQMSString_transformer: value is not a string', value)
		return value
	}
	const modifiedValue = value
		.replace(/"/g, '')
		.replace(/'/g, `"`)
		.replace(/&Prime;/g, `\\"`)
		.replace(/&prime;/g, `'`)
		.replace(/\\/g, '')
		.slice(1, -1);
	console.log('stringToQMSString_transformer', { value, modifiedValue })

	return modifiedValue
}
export const string_transformer = (value: unknown): string | unknown => {
	if (getPreciseType(value) !== 'string') {
		console.warn('string_transformer: value is not a string', value)
		return value
	}
	return `'${value.replaceAll(`"`, `&Prime;`).replaceAll(`'`, `&prime;`)}'`;
};
export const string_transformerREVERSE = (value: unknown, onlySingleQuotes?: boolean): string | unknown => {
	if (getPreciseType(value) !== 'string') {
		console.warn('string_transformer: value is not a string', value)
		return value
	}
	if (onlySingleQuotes) {
		return value.replaceAll(`'`, ``)
	}
	return value.replaceAll(`&Prime;`, `"`).replaceAll(`&prime;`, `'`)

};

export const number_transformer = (value: unknown): number | unknown => {
	if (getPreciseType(value) !== 'number') {
		console.warn('number_transformer: value is not a number', value)
		return value
	}
	//value * 1 removes leadin zeros: 0001 becomes 1, 0001.5 becomes 1.5
	return value * 1;
};
export const ISO8601_transformerGETDEFAULTVAl = (): string => {
	return ISO8601_transformerREVERSE(string_transformer(new Date().toISOString()))
};
export const ISO8601_transformer = (value: string): string | unknown => {
	let date_ISO8601 = new Date(value).toISOString();
	return string_transformer(date_ISO8601);
};
export const ISO8601_transformerREVERSE = (value: unknown): string => {
	// Convert ISO 8601 string to Date object
	const dateObject = new Date(string_transformerREVERSE(value, true));
	// Extract individual components
	const year = dateObject.getFullYear().toString().padStart(4, '0');
	const preMonth = dateObject.getMonth() + 1; // Months are zero-indexed
	const month = preMonth.toString().padStart(2, '0');
	const day = dateObject.getDate().toString().padStart(2, '0');
	const hour = dateObject.getHours().toString().padStart(2, '0');
	const minute = dateObject.getMinutes().toString().padStart(2, '0');
	//const second = dateObject.getSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day}T${hour}:${minute}`
};

interface GeoJSONGeometry {
	type: string;
	coordinates: number[] | number[][] | number[][][];
}

interface GeoJSONFeature {
	geometry: GeoJSONGeometry;
	type: string;
	properties: Record<string, unknown>;
}

interface GeoJSONFeatureCollection {
	features: GeoJSONFeature[];
	type: string;
}

export const geojson_transformer = (value: GeoJSONFeatureCollection): GeoJSONGeometry | GeoJSONGeometry[] => {
	const featuresLength = value.features.length;
	const geojson = value.features.map((feature) => {
		const geometry = JSON.parse(JSON.stringify(feature.geometry))
		geometry.type = string_transformer(geometry.type);
		return geometry;
	});
	console.log('geojson_transformer', { geojson, value }, geojson_transformerREVERSE(geojson))
	if (featuresLength == 1) {
		return geojson[0];
	}
	return geojson;//this line (return geojson;) is useful in case the endpoint supports multi-polygon or multi-geometry in general...
};
export const geojson_transformerREVERSE = (value: GeoJSONGeometry | GeoJSONGeometry[]): GeoJSONFeatureCollection => {
	const valueType = getPreciseType(value)
	if (valueType == 'object') {
		value = [value]
	}
	value = JSON.parse(string_transformerREVERSE(JSON.stringify(value), true));

	return {
		features: value.map((feature) => {
			return { geometry: feature, type: 'Feature', properties: {} }
		}),
		type: "FeatureCollection"
	}
};
export const boolean_transformer = (value: unknown): boolean => {
	if (value == undefined) {
		return false;
	}
	return value;
};
const escapeAllSigngleAndDoubleQuotes = (str: string): string => {
	return str.replace(/["']/g, (match) => {
		return `\\${match}`;
	});
}
// export const stringContainingQuotes_transformer = (value) => {

// 	//const base64 = btoa(value)
// 	//const escaped = escapeAllSigngleAndDoubleQuotes(value)
// 	const modified = value.replaceAll(`'`, `~%`).replaceAll(`"`, `%~`)
// 	return `'${modified}'`;
// };
