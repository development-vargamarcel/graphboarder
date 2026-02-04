/**
 * Substitutes variables in a string with values from a dictionary.
 * Variables are identified by double curly braces, e.g. {{variableName}}.
 *
 * @param text - The text to process
 * @param variables - The dictionary of variable names and values
 * @returns The text with variables substituted
 */
export const substituteVariables = (text: string, variables: Record<string, string>): string => {
	if (!text) return text;
	return text.replace(/\{\{(.+?)\}\}/g, (match, p1) => {
		const key = p1.trim();
		return variables[key] !== undefined ? variables[key] : match;
	});
};
