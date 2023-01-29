import React from "react";
import { redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import ProjectModel from "~/db/models/project.server";
import { getUserFromCookie } from "~/services/auth.server";
import TopMenu from "~/components/TopMenu";
import { action as actionLogout } from "./action.logout";

export const action = async ({ request }) => {
  const formData = await request.formData();
  if (formData.get("action") === "logout") {
    return await actionLogout({ request, to: "/project/new-project/register" });
  }
  const user = await getUserFromCookie(request, { failureRedirect: "/project/new-project" });
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
  return redirect(`/project/${newProject._id}`);
};

export const loader = async ({ request }) => {
  const user = await getUserFromCookie(request, { failureRedirect: "/project/new-project" });

  // const userProjects = [];
  // for (const organisationId of user.organisations) {
  // const organisationProjects = await ProjectModel.find({ organisation: organisationId });

  //   userProjects.push(...organisationProjects);
  // }

  const projects = await ProjectModel.find({ "users.user": user._id });
  return {
    projects: projects,
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
  const { projects, user } = useLoaderData();
  const newProjectFetcher = useFetcher();

  return (
    <div className="flex h-full max-h-full w-full max-w-full flex-col overflow-hidden">
      <TopMenu />
      <h1 className="m-4 text-3xl">Welcome to Roadmap, the table to make your roadmaps ! 🗺️</h1>
      <main className="relative flex flex-wrap justify-center gap-4 overflow-auto p-4 md:justify-start md:gap-16 md:p-16">
        {projects.map((project) => (
          <div key={project._id} className="flex shrink-0 basis-full flex-col justify-between md:basis-1/4">
            <div className="m-auto block w-full max-w-sm rounded-lg bg-white p-6 drop-shadow-lg md:m-0">
              <h5 className="mb-2 text-xl font-medium leading-tight text-gray-900">
                {project.title || "Un futur projet de maboule"}
              </h5>
              <p className="mb-4 max-h-24 overflow-y-auto text-base text-gray-700">
                {(project.description || "Ya pas de description encore, mais ça ne saurait tarder ?")
                  ?.split("\n")
                  .map((sentence, index) => (
                    <React.Fragment key={sentence + index}>
                      {sentence}
                      <br />
                    </React.Fragment>
                  ))}
              </p>
              <Link
                to={`/project/${project._id}`}
                className=" inline-block rounded bg-gray-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-800 active:shadow-lg"
              >
                🏎️ Go !
              </Link>
            </div>
          </div>
        ))}
        <newProjectFetcher.Form
          method="post"
          id="new-form"
          className="flex shrink-0 basis-full flex-col justify-between md:basis-1/4"
        >
          <div className="m-auto block w-full max-w-sm rounded-lg bg-white p-6 drop-shadow-lg md:m-0">
            <h5 className="mb-2 text-xl font-medium leading-tight text-gray-900">+ Nouveau projet</h5>
            <p className="mb-4 text-base text-gray-700">Cliquez ici pour commencer un nouveau projet !</p>
            <button
              type="submit"
              className=" inline-block rounded bg-gray-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-800 active:shadow-lg"
            >
              🏎️ Go !
            </button>
          </div>
        </newProjectFetcher.Form>
      </main>
    </div>
  );
}
