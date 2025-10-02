// Production-safe logging utility
const IS_DEV = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (IS_DEV) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (IS_DEV) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (IS_DEV) console.debug(...args);
  },
};
