import React, { useEffect } from "react";
import { redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import ProjectModel from "~/db/models/project.server";
import { getUserFromCookie } from "~/services/auth.server";
import TopMenu from "~/components/TopMenu";
import { action as actionLogout } from "./action.logout";
import FeatureModel from "~/db/models/feature.server";
import { defaultFeatures } from "~/utils/defaultFeatures.server";
import EventModel from "~/db/models/event.server";
import { usePageLoadedEvent, useUserEvent } from "./action.event";

export const action = async ({ request }) => {
  const user = await getUserFromCookie(request, { failureRedirect: "/project/new-project" });
  const formData = await request.formData();
  if (formData.get("action") === "logout") {
    EventModel.create({
      event: "PROJECTS LOGOUT",
      user: user?._id,
    });
    return await actionLogout({ request, to: "/project/new-project/register" });
  }
  const newProject = await ProjectModel.create({
    createdBy: user._id,
    users: [
      {
        user: user._id,
        permission: "admin",
        email: user.email,
      },
    ],
  });
  EventModel.create({
    event: "PROJECTS NEW PROJECT",
    user: user?._id,
    project: newProject._id,
  });
  for (const feature of defaultFeatures) {
    await FeatureModel.create({
      project: newProject._id,
      createdBy: user._id,
      ...feature,
    });
  }
  return redirect(`/project/${newProject._id}`);
};

export const loader = async ({ request }) => {
  const user = await getUserFromCookie(request, { failureRedirect: "/project/new-project" });

  const projects = await ProjectModel.find({ "users.user": user._id });

  return {
    projects,
    user,
  };
};

export const meta = () => {
  return [
    {
      title: `My projects | Froadmap`,
    },
  ];
};

export default function Index() {
  const { projects, user, features } = useLoaderData();
  const newProjectFetcher = useFetcher();

  const sendUserEvent = useUserEvent();
  usePageLoadedEvent({
    event: "PROJECTS PAGE LOADED",
  });

  const colors = [
    ["#2A9D8F", "#000"],
    ["#F4A261", "#000"],
    ["#fb8500", "#000"],
    ["#219ebc", "#000"],
    ["#E76F51", "#000"],
    ["#023047", "#fff"],
    ["#ffb703", "#000"],
    ["#8ecae6", "#000"],
    ["#E9C46A", "#000"],
    ["#264653", "#fff"],
  ];

  return (
    <div className="flex h-full max-h-full w-full max-w-full flex-col overflow-auto">
      <TopMenu />
      <h1 className="m-8 mt-16 text-4xl font-semibold md:mx-16 md:text-6xl">
        Welcome to Froadmap, the table to make your feature's roadmaps!
      </h1>
      {projects.length > 0 && (
        <p className="m-8 text-xl md:mx-16">
          You have {projects.length} project{projects.length > 1 ? "s" : ""} in progress.
        </p>
      )}
      <main className="relative flex flex-wrap justify-center gap-8 p-4 md:justify-start md:gap-16 md:p-16">
        {projects.map((project, index) => (
          <Link
            to={`/project/${project._id}`}
            key={project._id}
            onClick={() => {
              sendUserEvent({
                event: "PROJECTS OPEN PROJECT",
                projectId: project._id,
              });
            }}
            className="flex shrink-0 basis-full flex-col justify-between md:basis-1/4"
          >
            <div className="m-auto block w-full max-w-sm border-2 bg-white md:m-0 md:min-w-xs">
              <h5
                className="p-6 text-xl font-medium leading-tight text-gray-900"
                style={{
                  backgroundColor: colors[index % colors.length][0],
                  color: colors[index % colors.length][1],
                }}
              >
                {project.title || "A crazy project... yet to come!"}
              </h5>
              <p className="mx-6 my-2 h-18 text-base text-gray-700 line-clamp-3">
                {(project.description || "No description yet, but it won't be long?")
                  ?.split("\n")
                  .map((sentence, index) => (
                    <React.Fragment key={sentence + index}>
                      {sentence}
                      <br />
                    </React.Fragment>
                  ))}
              </p>
              <p className="inline-block w-full bg-black px-6 py-4 text-center text-xs font-medium uppercase leading-tight text-white transition duration-150 ease-in-out hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-800 active:shadow-lg">
                🏎️ Go !
              </p>
            </div>
          </Link>
        ))}
        <newProjectFetcher.Form
          method="post"
          id="new-form"
          className="flex shrink-0 basis-full cursor-pointer flex-col justify-between md:basis-1/4"
          onClick={(e) => {
            // submit the form
            e.currentTarget.submit();
          }}
        >
          <div className="m-auto block w-full max-w-sm border-2 bg-white md:m-0 md:min-w-xs">
            <h5 className="p-6 text-xl font-medium leading-tight text-gray-900">+ New project</h5>
            <p className="mb-0 h-24 px-6 py-2 text-base text-gray-700 line-clamp-3">
              Click here to start a new project{projects.length === 0 ? " and see what Froadmap is all about!" : "!"}
            </p>
            <button
              type="submit"
              className="inline-block w-full bg-black px-6 py-4 text-center text-xs font-medium uppercase leading-tight text-white transition duration-150 ease-in-out hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-800 active:shadow-lg"
            >
              🏎️ Go !
            </button>
          </div>
        </newProjectFetcher.Form>
      </main>
    </div>
  );
}

export const shouldRevalidate = (props) => {
  return false;
};
