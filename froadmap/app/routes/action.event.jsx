// import { useCallback } from "react";
// import { useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import EventModel from "~/db/models/event.server";
import { getUnauthentifiedUserFromCookie } from "~/services/auth.server";
import { catchErrors } from "~/services/catchErrors";

export const action = catchErrors(async ({ request }) => {
  console.log("BADABUM");
  const user = await getUnauthentifiedUserFromCookie(request);
  const formData = await request.formData();
  const eventObject = {
    event: formData.get("event"),
    value: formData.get("value") ?? undefined,
    projectId: formData.get("projectId") ?? undefined,
    featureId: formData.get("featureId") ?? undefined,
    user: user?._id ?? undefined,
  };
  EventModel.create(eventObject);
  return json({ ok: true });
});

// export const useUserEvent = () => {
//   const submit = useSubmit();
//   return useCallback(
//     ({ event, value, projectId, featureId }) => {
//       if (!event) return;
//       const formData = new FormData();
//       formData.append("event", event);
//       if (value) formData.append("value", value);
//       if (projectId) formData.append("projectId", projectId);
//       if (featureId) formData.append("featureId", featureId);
//       submit(formData, { method: "POST", action: "/action/event", reloadDocument: false });
//     },
//     [submit]
//   );
// };

export default () => null;
