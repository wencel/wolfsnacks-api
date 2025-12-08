import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Configure pino for production (Render) - JSON output
// For development, use pretty printing
const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
});

export default logger;

