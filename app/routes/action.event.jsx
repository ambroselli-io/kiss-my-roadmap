import { json } from "@remix-run/node";
import EventModel from "../db/models/event.server";
import { getUnauthentifiedUserFromCookie } from "../services/auth.server";
import { useCallback, useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";

export const action = async ({ request }) => {
  const user = await getUnauthentifiedUserFromCookie(request);
  const formData = await request.formData();
  const eventObject = {
    event: formData.get("event"),
    value: formData.get("value") ?? undefined,
    project: formData.get("projectId") === "new-project" ? undefined : formData.get("projectId") ?? undefined,
    feature: formData.get("featureId") ?? undefined,
    user: user?._id ?? undefined,
  };
  EventModel.create(eventObject);
  return json({ ok: true });
};

export const useUserEvent = () => {
  const userEventfetcher = useFetcher();
  return useCallback(
    ({ event, value, projectId, featureId }) => {
      if (!event) return;
      if (process.env.NODE_ENV !== "production") {
        console.log("sendUserEvent", { event, value, projectId, featureId });
      }
      const formData = new FormData();
      formData.append("event", event);
      if (value) formData.append("value", value);
      if (projectId) formData.append("projectId", projectId);
      if (featureId) formData.append("featureId", featureId);
      userEventfetcher.submit(formData, { method: "POST", action: "/action/event" });
    },
    [userEventfetcher]
  );
};

export const usePageLoadedEvent = ({ event, value, projectId, featureId }) => {
  const sendUserEvent = useUserEvent();

  const sent = useRef(false);

  useEffect(() => {
    if (!sent.current || sent.current !== JSON.stringify({ event, value, projectId, featureId })) {
      sendUserEvent({ event, value, projectId, featureId });
      sent.current = JSON.stringify({ event, value, projectId, featureId });
    }
  }, []);
};
