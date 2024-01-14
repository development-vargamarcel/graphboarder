import { getPreciseType } from "./usefulFunctions";

export const string_transformer = (value) => {
	if (typeof value !== 'string') {
		console.warn('string_transformer: value is not a string', value)
		return value
	}
	return `'${value.replaceAll(`"`, `&Prime;`).replaceAll(`'`, `&prime;`)}'`;
};
export const string_transformerREVERSE = (value, onlyPrimeSymbol) => {
	if (typeof value !== 'string') {
		console.warn('string_transformer: value is not a string', value)
		return value
	}
	if (onlyPrimeSymbol) {
		return value.replaceAll(`'`, ``)
	}
	return value.replaceAll(`&Prime;`, `"`).replaceAll(`&prime;`, `'`)

};

export const number_transformer = (value) => {
	if (typeof value !== 'number') {
		console.warn('number_transformer: value is not a number', value)
		return value
	}
	//value * 1 removes leadin zeros: 0001 becomes 1, 0001.5 becomes 1.5
	return value * 1;
};
export const ISO8601_transformer = (value) => {
	let date_ISO8601 = new Date(value).toISOString();
	return string_transformer(date_ISO8601);
};
export const geojson_transformer = (value) => {
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
export const geojson_transformerREVERSE = (value) => {
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
export const boolean_transformer = (value) => {
	if (value == undefined) {
		return false;
	}
	return value;
};
const escapeAllSigngleAndDoubleQuotes = (str) => {
	return str.replace(/["']/g, (match) => {
		return `\\${match}`;
	});
}
export const stringContainingQuotes_transformer = (value) => {

	//const base64 = btoa(value)
	//const escaped = escapeAllSigngleAndDoubleQuotes(value)
	const modified = value.replaceAll(`'`, `~%`).replaceAll(`"`, `%~`)
	return `'${modified}'`;
};