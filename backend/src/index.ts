import app from "./app";
import { DBConnection } from "./util/data-source";
import logger from "./util/loggers";

const port = process.env.PORT || 3000;

DBConnection.initialize()
  .then(() => {
    // here you can start to work with your database
    logger.info("Data source has been initialized");
  })
  .catch((error) => {
    logger.error(error.message);
    logger.debug(error.stack);
  });

try {
  app
    .listen(port, () => {
      /* eslint-disable no-console */
      logger.info(`Listening: http://localhost:${port}`);
      /* eslint-enable no-console */
    })
    .on("error", (error) => {
      logger.error(error.message);
      logger.debug(error.stack);
    });
} catch (error: any) {
  logger.error(error.message);
  logger.debug(error.stack);
  process.exit(1);
}
