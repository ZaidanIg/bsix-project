/**
 * A simple layered logger utility for best practices.
 * Supports different log levels based on the environment.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// In production, default to INFO. In development, default to DEBUG.
const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

export const logger = {
  debug: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },
  info: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(formatMessage('INFO', message, meta));
    }
  },
  warn: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },
  error: (message, error, meta) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
      if (error && error.stack) {
        console.error(error.stack);
      } else if (error) {
        console.error(error);
      }
    }
  },
};

export default logger;
