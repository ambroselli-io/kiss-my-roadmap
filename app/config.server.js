import dotenv from "dotenv";
import { name, description } from "../package.json";
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

dotenv.config({ path: ".env" });

const MONGO_URL = process.env.MONGODB_ADDON_URI;
const APP_NAME = capitalizeFirstLetter(name);
const APP_DESCRIPTION = description;
const MONGODB_DB_NAME = APP_NAME;
const APP_URL = process.env.APP_URL;
const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET || "not_so_secret";
const ENVIRONMENT = process.env.NODE_ENV;
const SENTRY_XXX = process.env.SENTRY_XXX;
const WHITE_LIST_DOMAINS = process.env.WHITE_LIST_DOMAINS;
const TIPIMAIL_API_USER = process.env.TIPIMAIL_API_USER;
const TIPIMAIL_API_KEY = process.env.TIPIMAIL_API_KEY;
const CELLAR_ADDON_HOST = process.env.CELLAR_ADDON_HOST;
const CELLAR_ADDON_KEY_ID = process.env.CELLAR_ADDON_KEY_ID;
const CELLAR_ADDON_KEY_SECRET = process.env.CELLAR_ADDON_KEY_SECRET;
const PUBLIC_BUCKET_NAME = APP_NAME.toLocaleLowerCase();

const FINTECTURE_APP_ID = process.env.FINTECTURE_APP_ID;
const FINTECTURE_APP_SECRET = process.env.FINTECTURE_APP_SECRET;
const FINTECTURE_PRIVATE_KEY = process.env.FINTECTURE_PRIVATE_KEY;
const FINTECTURE_ENV = process.env.FINTECTURE_ENV;

export {
  MONGO_URL,
  APP_URL,
  APP_NAME,
  APP_DESCRIPTION,
  PORT,
  SECRET,
  ENVIRONMENT,
  SENTRY_XXX,
  WHITE_LIST_DOMAINS,
  TIPIMAIL_API_USER,
  TIPIMAIL_API_KEY,
  CELLAR_ADDON_HOST,
  CELLAR_ADDON_KEY_ID,
  CELLAR_ADDON_KEY_SECRET,
  PUBLIC_BUCKET_NAME,
  MONGODB_DB_NAME,
  FINTECTURE_APP_ID,
  FINTECTURE_APP_SECRET,
  FINTECTURE_PRIVATE_KEY,
  FINTECTURE_ENV,
};
