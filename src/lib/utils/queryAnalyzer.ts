import { parse, visit, type ASTNode } from 'graphql';
import { Logger } from '$lib/utils/logger';

export interface QueryComplexity {
	depth: number;
	fieldCount: number;
	error?: string;
}

export const calculateComplexity = (query: string): QueryComplexity => {
	try {
		if (!query || !query.trim()) {
			return { depth: 0, fieldCount: 0 };
		}

		const ast = parse(query);
		let depth = 0;
		let fieldCount = 0;
		let currentDepth = 0;

		visit(ast as ASTNode, {
			Field: {
				enter: () => {
					fieldCount++;
					currentDepth++;
					if (currentDepth > depth) {
						depth = currentDepth;
					}
				},
				leave: () => {
					currentDepth--;
				}
			}
		});

		return { depth, fieldCount };
	} catch (e) {
		Logger.warn('Failed to calculate query complexity', e);
		return { depth: 0, fieldCount: 0, error: (e as Error).message };
	}
};

export const calculateResponseSize = (data: any): number => {
	try {
		if (data === undefined) return 0;
		// Approximation of byte size
		const json = JSON.stringify(data);
		if (typeof TextEncoder !== 'undefined') {
			return new TextEncoder().encode(json).length;
		}
		return json.length; // Fallback to string length (roughly bytes for ASCII)
	} catch (e) {
		Logger.warn('Failed to calculate response size', e);
		return 0;
	}
};

export const formatBytes = (bytes: number, decimals = 2): string => {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
