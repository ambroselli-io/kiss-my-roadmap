import { json } from "@remix-run/node";
import { capture } from "./sentry.server";

export const catchErrors = (fn) => {
  return (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      capture(e, { extra: args });
    }
    return json({
      ok: false,
      error: "An unexpected error occurred. We have been notified and will fix it shortly.",
    });
  };
};
