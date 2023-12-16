import * as winston from 'winston';
import 'winston-mongodb'; // This will extend winston.transports

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const getLogger = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
      format.json()
    ),
    transports: [
      // MongoDB transport
      new transports.MongoDB({
        db: process.env.DATABASE_URL,
        storeHost: true,
        options: { useUnifiedTopology: true },
        expireAfterSeconds: 10520000, // 4 months in seconds
        metaKey: 'meta',
        capped: true,
        level: 'info',
      }),
      // Console transport
      new transports.Console({
        format: combine(timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }), myFormat),
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      }),
    ],
  });

  return logger;
};

export = getLogger;
