export const convertArrayToCSV = (data: any[]): string => {
	if (!data || !data.length) {
		return '';
	}

	const flattenObject = (obj: any, prefix = ''): any => {
		return Object.keys(obj).reduce((acc: any, k: string) => {
			const pre = prefix.length ? prefix + '.' : '';
			if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
				Object.assign(acc, flattenObject(obj[k], pre + k));
			} else {
				acc[pre + k] = obj[k];
			}
			return acc;
		}, {});
	};

	const flatData = data.map((item) => flattenObject(item));
	const headers = Array.from(new Set(flatData.reduce((keys, obj) => keys.concat(Object.keys(obj)), [])));

	const csvContent = [
		headers.join(','),
		...flatData.map((row) =>
			headers
				.map((header) => {
					let val = row[header as keyof typeof row];
					if (val === null || val === undefined) {
						return '';
					}
					val = String(val);
					if (val.includes(',') || val.includes('"') || val.includes('\n')) {
						val = `"${val.replace(/"/g, '""')}"`;
					}
					return val;
				})
				.join(',')
		)
	].join('\n');

	return csvContent;
};

export const downloadCSV = (data: any[], filename = 'export.csv') => {
	const csv = convertArrayToCSV(data);
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setTimeout(() => URL.revokeObjectURL(url), 100);
	}
};

/**
 * Downloads the given data as a JSON file.
 * @param data - The data array to download.
 * @param filename - The name of the file to download (default: 'export.json').
 */
export const downloadJSON = (data: any[], filename = 'export.json') => {
	if (!data || !data.length) {
		return;
	}

	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
	const link = document.createElement('a');
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setTimeout(() => URL.revokeObjectURL(url), 100);
	}
};
