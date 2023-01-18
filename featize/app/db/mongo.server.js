import mongoose from "mongoose";
import { MONGO_URL, MONGODB_DB_NAME } from "../config";

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
let dbConnection = mongoose.connection;

if (process.env.NODE_ENV === "production") {
  dbConnection = mongoose.createConnection(MONGO_URL);
} else {
  if (!global.__db) {
    global.__db = mongoose.createConnection(MONGO_URL);
    global.__db.models = {};
    global.__syncIndexes = [];
  }
  dbConnection = global.__db;
  dbConnection.models = dbConnection.models || {};
}

dbConnection.on(
  "error",
  console.error.bind(console, `MongoDB ${MONGODB_DB_NAME} connection error:`)
);

dbConnection.once("open", async () => {
  console.log("\x1b[1m%s\x1b[0m", `${MONGODB_DB_NAME} connected`);
  const migrations = await import("./migrations.server");
  migrations.migrate();
});

export default dbConnection;
