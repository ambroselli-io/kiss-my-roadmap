import * as Sentry from "@sentry/remix";
import { ENVIRONMENT } from "~/config.server";

// https://docs.sentry.io/platforms/javascript/enriching-events/context/#example-usages

export const capture = (err, context = {}) => {
  if (typeof context === "string") {
    context = JSON.parse(context);
  } else {
    context = JSON.parse(JSON.stringify(context));
  }
  if (Sentry && err) {
    if (typeof err === "string") {
      if (ENVIRONMENT !== "production") {
        Sentry.captureMessage(`[${ENVIRONMENT}] ${err}`, context);
      } else {
        Sentry.captureMessage(err, context);
      }
    } else {
      if (ENVIRONMENT !== "production") err.message = `[${ENVIRONMENT}] ${err.message}`;
      Sentry.captureException(err, context);
    }
  }
  if (["development", "test"].includes(process.env.NODE_ENV)) {
    if (typeof err === "string") {
      console.log("capture", `[${ENVIRONMENT}] ${err}`, JSON.stringify(context, null, 2));
    } else {
      console.log("capture", err, JSON.stringify(context, null, 2));
    }
  }
};
