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
class LoggerService {
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

    private formatMessage(level: string, message: unknown, context?: unknown): any[] {
        const timestamp = new Date().toISOString();
        const args = [`[${timestamp}] [${level}]`, message];
        if (context) {
            args.push(context);
        }
        return args;
    }

    /**
     * Logs a debug message.
     * @param message - The message to log.
     * @param context - Optional additional data to log.
     */
    debug(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(...this.formatMessage('DEBUG', message, context));
        }
    }

    /**
     * Logs an info message.
     * @param message - The message to log.
     * @param context - Optional additional data to log.
     */
    info(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.INFO) {
            console.info(...this.formatMessage('INFO', message, context));
        }
    }

    /**
     * Logs a warning message.
     * @param message - The message to log.
     * @param context - Optional additional data to log.
     */
    warn(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.WARN) {
            console.warn(...this.formatMessage('WARN', message, context));
        }
    }

    /**
     * Logs an error message.
     * @param message - The message to log.
     * @param context - Optional additional data to log.
     */
    error(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.ERROR) {
            console.error(...this.formatMessage('ERROR', message, context));
        }
    }
}

export const Logger = new LoggerService();
