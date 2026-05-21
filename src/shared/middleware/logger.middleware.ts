import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body } = req;
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      const line = `${method} ${originalUrl} ${statusCode} +${ms}ms`;
      if (statusCode >= 500) {
        this.logger.error(line);
      } else if (statusCode >= 400) {
        this.logger.warn(line);
      } else {
        this.logger.log(line);
      }
    });

    res.on('error', (err: Error) => {
      const ms = Date.now() - start;
      this.logger.error(
        `${method} ${originalUrl} STREAM ERROR +${ms}ms — ${err.message}`,
        err.stack,
      );
    });

    if (Object.keys(body as object).length) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    next();
  }
}
