import { Logger } from '$lib/utils/logger';

export interface ParsedCurl {
    query: string;
    variables: Record<string, any>;
    headers: Record<string, string>;
    url: string;
}

const parseShellArgs = (str: string): string[] => {
    const args: string[] = [];
    let current = '';
    let quote: 'single' | 'double' | null = null;
    let escaped = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (escaped) {
            // In double quotes, backslash only escapes $ ` " \ and newline.
            // But for simplicity let's assume it escapes everything if outside single quotes.
            // Inside single quotes, backslash is literal.
            // BUT, the pattern '...'\''...' relies on backslash OUTSIDE quotes.
            current += char;
            escaped = false;
            continue;
        }

        if (char === '\\') {
            if (quote === 'single') {
                current += char;
            } else {
                escaped = true;
            }
            continue;
        }

        if (quote === 'single') {
            if (char === "'") {
                quote = null;
            } else {
                current += char;
            }
        } else if (quote === 'double') {
            if (char === '"') {
                quote = null;
            } else {
                current += char;
            }
        } else {
            // Not in quote
            if (char === "'") {
                quote = 'single';
            } else if (char === '"') {
                quote = 'double';
            } else if (/\s/.test(char)) {
                if (current.length > 0) {
                    args.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
    }
    if (current.length > 0) args.push(current);
    return args;
};

export const parseCurlCommand = (curlCommand: string): ParsedCurl => {
    Logger.debug('Parsing cURL command', { length: curlCommand.length });

    // Normalize: remove line continuations (backslash at end of line)
    // We handle this by removing \\\n sequences first.
    // Note: The parseShellArgs handles backslash, but `\` followed by `\n` is usually skipped in shell.
    const cleanCommand = curlCommand.replace(/\\\n/g, '').replace(/\\\r\n/g, '').replace(/\n/g, ' ');

    const args = parseShellArgs(cleanCommand);

    const result: ParsedCurl = {
        query: '',
        variables: {},
        headers: {},
        url: ''
    };

    // Iterate args
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === 'curl') continue;

        if (arg.startsWith('http://') || arg.startsWith('https://')) {
            if (!result.url) result.url = arg;
            continue;
        }

        if (arg === '-H' || arg === '--header') {
            const headerValue = args[i + 1];
            if (headerValue) {
                const separatorIndex = headerValue.indexOf(':');
                if (separatorIndex > 0) {
                    const key = headerValue.substring(0, separatorIndex).trim();
                    const val = headerValue.substring(separatorIndex + 1).trim();
                    result.headers[key] = val;
                }
                i++; // Skip next arg
            }
        } else if (['-d', '--data', '--data-binary', '--data-raw'].includes(arg)) {
            const dataValue = args[i + 1];
            if (dataValue) {
                try {
                    const json = JSON.parse(dataValue);
                    if (json.query) result.query = json.query;
                    if (json.variables) result.variables = json.variables;
                } catch (e) {
                    Logger.warn('Failed to parse data JSON from cURL', e);
                }
                i++; // Skip next arg
            }
        }
        // If it's a URL and we haven't found one yet (and it wasn't caught above)
        // Sometimes URL is just the last arg? Or first?
        // Usually `curl url` or `curl options url`.
        else if (!arg.startsWith('-') && !result.url) {
             // Heuristic: if it looks like a URL or is the first non-flag arg
             // But we might pick up random args.
             // Let's assume URL starts with http.
        }
    }

    return result;
};
