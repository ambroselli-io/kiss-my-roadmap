import { json } from "@remix-run/node";
import { capture } from "./sentry.server";

export const catchErrors = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      capture(e, { extra: args });
    }
    return json({
      ok: false,
      error:
        "Désolé une erreur est survenue, l'équipe technique est prévenue et reviendra vers vous dans les plus brefs délais !",
    });
  };
};
