import app from "./app";
import { DBConnection } from "./util/data-source";

const port = process.env.PORT || 3000;

DBConnection.initialize()
  .then(() => {
    // here you can start to work with your database
    console.log("Data source has been initialized");
  })
  .catch((error) => console.log(error));

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
