import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export function createWinstonLogger(env: string) {
  const customFormat = winston.format.printf(
    ({ timestamp, level, module, status, message, data, context }) => {
      return `[KEYSTORE] ${timestamp} ${context} ${level.toUpperCase()} [${module || 'Main.cs'}] [${status || 'SUCCESS'}] ${message} ${data ? JSON.stringify(data) : ''}`;
    },
  );

  const transports: winston.transport[] = [];

  // Local/Development environment
  if (env === 'local' || env === 'development') {
    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          customFormat,
        ),
      }),
    );

    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: 'logs',
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '50d',
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          customFormat,
        ),
      }),
    );
  }

  // Test environment
  if (env === 'test') {
    transports.push(
      new winston.transports.Console({
        silent: true, // no logs during tests
      }),
    );
  }

  // Staging/UAT environment
  if (env === 'staging' || env === 'uat') {
    transports.push(
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          customFormat,
        ),
      }),
    );

    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: 'logs/app.log',
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '28m',
        maxFiles: '14d',
        level: 'info',
        format: customFormat,
      }),
    );
  }

  // Production environment
  if (env === 'production') {
    transports.push(
      new winston.transports.File({
        dirname: 'logs',
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          customFormat,
        ),
      }),
    );

    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: 'logs',
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'info',
        format: customFormat,
      }),
    );
  }

  return {
    transports,
  };
}
