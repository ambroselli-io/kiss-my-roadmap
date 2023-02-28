import { useLocation, useNavigate, useOutletContext } from "react-router";
import { Form, useTransition } from "@remix-run/react";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";
import { json } from "@remix-run/node";
import UserModel from "~/db/models/user.server";
import ProjectModel from "~/db/models/project.server";
import { useMemo, useState } from "react";
import EventModel from "~/db/models/event.server";
import { getUserFromCookie } from "~/services/auth.server";
import { usePageLoadedEvent } from "./action.event";

export const action = async ({ request, params }) => {
  const user = await getUserFromCookie(request);
  const formData = await request.formData();
  let projectId = params.projectId;
  const project = await ProjectModel.findById(projectId);
  const deleteUserId = formData.get("deleteUserId");
  if (deleteUserId) {
    project.users = project.users.filter((u) => u.user.toString() !== deleteUserId);
    await project.save();
    EventModel.create({
      project: projectId,
      user: user._id,
      event: "USER REMOVED FROM PROJECT",
      value: JSON.stringify({ user: deleteUserId }),
    });
    return json({ ok: true });
  }
  const userEmail = formData.get("newUserEmail");
  if (!userEmail?.length) return json({ ok: true });
  let userFromEmail = await UserModel.findOne({ email: userEmail });
  if (!userFromEmail) userFromEmail = await UserModel.create({ email: userEmail });
  if (project.users.find((u) => u.user.toString() === userFromEmail._id.toString())) return json({ ok: true });
  project.users.push({ user: userFromEmail._id, role: "admin", email: userEmail });
  await project.save();
  EventModel.create({
    project: projectId,
    user: user._id,
    event: "USER ADDED TO PROJECT",
    value: JSON.stringify({ user: userFromEmail._id, role: "admin", email: userEmail }),
  });
  return json({ ok: true });
};

const ProjectUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onClose = () => {
    navigate(location.pathname.replace("/users", ""));
  };
  const data = useOutletContext();
  const { project, user } = data;

  usePageLoadedEvent({
    event: "PROJECTS PAGE LOADED",
    projectId: project._id,
  });

  const { users } = project;
  const transition = useTransition();
  const usersToShow = useMemo(() => {
    if (!["submitting", "loading"].includes(transition.state)) return users;
    const userEmail = transition.submission?.formData?.get("newUserEmail");
    if (userEmail) {
      const newUser = { user: "new-user-id", email: userEmail, role: "admin" };
      return [...users, newUser];
    }
    const deleteUserId = transition.submission?.formData?.get("deleteUserId");
    if (deleteUserId) return users.filter((u) => u.user !== deleteUserId);
    return users;
  }, [users, transition]);

  const [copyCaption, setCopyCaption] = useState(`Copy ${project.title}'s URL`);

  return (
    <ModalContainer open onClose={onClose} blurryBackground>
      <ModalHeader
        title={
          usersToShow.length > 1
            ? `Your teammates on ${project.title}`
            : `Invite teammates to collaborate on ${project.title}`
        }
      />
      <ModalBody className="!pb-0">
        <Form method="POST" id="users-form">
          <div className="px-4 pt-4">
            {usersToShow.map(({ role, user: userId, email }) => {
              const isMe = user._id === userId;
              return (
                <div
                  key={userId}
                  className={["mb-4 flex items-center justify-between", isMe ? "font-bold" : ""].join(" ")}
                >
                  <p className="flex items-center">
                    {email}
                    {isMe ? " (me)" : ""}
                  </p>
                  {(!isMe || users.length > 1) && (
                    <button className="text-red-500" name="deleteUserId" value={userId} type="submit">
                      &#10005;
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex" key={usersToShow.length}>
            <input type="submit" hidden />
            <input
              name="newUserEmail"
              type="email"
              autoFocus
              className="outline-main block w-full bg-transparent px-4 py-2.5 text-black transition-all"
              placeholder="ilike@froadmaps.com"
            />
            <button type="submit" className="bg-black  px-8 py-3 text-white">
              Add
            </button>
          </div>
        </Form>
      </ModalBody>
      {usersToShow?.length <= 1 ? (
        <ModalFooter />
      ) : (
        <ModalFooter className="flex-col items-center overflow-hidden !p-0">
          <button
            type="button"
            form="register-form"
            className="w-full bg-black px-4 py-3 text-white"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href.replace("/users", ""));
              setCopyCaption("Copied!");
              setTimeout(() => setCopyCaption(`Copy ${project.title}'s URL`), 2000);
            }}
          >
            {copyCaption}
          </button>
        </ModalFooter>
      )}
    </ModalContainer>
  );
};

export default ProjectUsers;
