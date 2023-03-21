export const string_transformer = (value) => {
	return `'${value}'`;
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
	if (featuresLength == 1) {
		return geojson[0];
	}
	return geojson;//this line (return geojson;) is useful in case the endpoint supports multi-polygon or multi-geometry in general...
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
	const modified = value.replaceAll(`'`, `~`).replaceAll(`"`, `~`)
	return `'${modified}'`;
};