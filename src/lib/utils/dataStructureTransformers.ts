export const string_transformer = (value) => {
	return `'${value}'`;
};
export const ISO8601_transformer = (value) => {
	let date_ISO8601 = new Date(value).toISOString();
	return string_transformer(date_ISO8601);
};
export const geojson_transformer = (value) => {
	const featuresLength = value.features.length;
	return value.features.map((feature) => {
		const geometry = feature.geometry;
		geometry.type = string_transformer(geometry.type);
		if (featuresLength == 1) {
			return geometry[0];
		}
		return geometry;
	});
};
export const boolean_transformer = (value) => {
	if (value == undefined) {
		return false;
	}
	return value;
};
