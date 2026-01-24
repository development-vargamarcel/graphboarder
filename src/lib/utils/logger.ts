export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

class LoggerService {
    private level: LogLevel = LogLevel.DEBUG;

    constructor() {
        // Default to DEBUG for now, could be configurable
    }

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

    debug(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(...this.formatMessage('DEBUG', message, context));
        }
    }

    info(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.INFO) {
            console.info(...this.formatMessage('INFO', message, context));
        }
    }

    warn(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.WARN) {
            console.warn(...this.formatMessage('WARN', message, context));
        }
    }

    error(message: unknown, context?: unknown) {
        if (this.level <= LogLevel.ERROR) {
            console.error(...this.formatMessage('ERROR', message, context));
        }
    }
}

export const Logger = new LoggerService();
