import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`api listening on http://localhost:${env.PORT}`);
  logger.info(`docs at http://localhost:${env.PORT}/api/docs`);
});
