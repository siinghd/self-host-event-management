import getLogger from './getLogger';

// change logger option, now for prod and dev is used mongodb
// set false in info to log to console in dev
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logger: any = getLogger();
/* if (process.env.NODE_ENV !== 'production') {
  logger = getLogger();
} else {
  logger = getLogger();
} */

export = logger;
