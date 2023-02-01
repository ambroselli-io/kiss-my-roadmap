import { json } from "@remix-run/node";
import EventModel from "~/db/models/event.server";
import { getUnauthentifiedUserFromCookie } from "~/services/auth.server";

export const action = async ({ request }) => {
  throw new Error("test action bug");
};
