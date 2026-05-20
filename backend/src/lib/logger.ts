// thin wrapper — keeps it easy to swap in pino later without touching call sites
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, msg: string, meta?: unknown) {
  const ts = new Date().toISOString();
  if (meta !== undefined) {
    console[level === 'debug' ? 'log' : level](`[${ts}] ${level}: ${msg}`, meta);
  } else {
    console[level === 'debug' ? 'log' : level](`[${ts}] ${level}: ${msg}`);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
};
