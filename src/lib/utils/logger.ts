/**
 * Enum representing the severity levels of logs.
 */
export enum LogLevel {
    /** Detailed debug information, useful for development. */
    DEBUG = 0,
    /** General informational messages. */
    INFO = 1,
    /** Warning messages indicating potential issues. */
    WARN = 2,
    /** Error messages indicating failures. */
    ERROR = 3
}

/**
 * A simple logging service that supports log levels and formatting.
 *
 * Usage:
 * ```ts
 * import { Logger } from '$lib/utils/logger';
 * Logger.debug('My message', { some: 'data' });
 * ```
 */
export class LoggerService {
    private level: LogLevel = LogLevel.DEBUG;

    constructor() {
        // Default to DEBUG for now, could be configurable
    }

    /**
     * Sets the minimum log level. Messages below this level will be suppressed.
     * @param level - The new log level.
     */
    setLevel(level: LogLevel) {
        this.level = level;
    }

    private formatMessage(level: string, ...args: unknown[]): any[] {
        const timestamp = new Date().toISOString();
        return [`[${timestamp}] [${level}]`, ...args];
    }

    /**
     * Logs a debug message.
     * @param args - The arguments to log.
     */
    debug(...args: unknown[]) {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(...this.formatMessage('DEBUG', ...args));
        }
    }

    /**
     * Logs an info message.
     * @param args - The arguments to log.
     */
    info(...args: unknown[]) {
        if (this.level <= LogLevel.INFO) {
            console.info(...this.formatMessage('INFO', ...args));
        }
    }

    /**
     * Logs a warning message.
     * @param args - The arguments to log.
     */
    warn(...args: unknown[]) {
        if (this.level <= LogLevel.WARN) {
            console.warn(...this.formatMessage('WARN', ...args));
        }
    }

    /**
     * Logs an error message.
     * @param args - The arguments to log.
     */
    error(...args: unknown[]) {
        if (this.level <= LogLevel.ERROR) {
            console.error(...this.formatMessage('ERROR', ...args));
        }
    }
}

export const Logger = new LoggerService();
