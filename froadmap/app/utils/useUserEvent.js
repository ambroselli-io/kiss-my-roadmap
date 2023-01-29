import { useCallback } from "react";
import { useFetcher, useSubmit } from "@remix-run/react";

export const useUserEvent = () => {
  const eventFetcher = useFetcher();
  return ({ event, value, projectId, featureId }) => {
    if (!event) return;
    const formData = new FormData();
    formData.append("event", event);
    if (value) formData.append("value", value);
    if (projectId) formData.append("projectId", projectId);
    if (featureId) formData.append("featureId", featureId);
    eventFetcher.submit(formData, { method: "POST", action: "/action/event", replace: true, reloadDocument: false });
  };
};
