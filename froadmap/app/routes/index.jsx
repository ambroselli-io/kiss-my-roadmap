import React from "react";
import { redirect } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import ProjectModel from "~/db/models/project.server";
import UserModel from "~/db/models/user.server";
import { APP_NAME } from "~/config.client";

export const action = async () => {
  console.log("action");
  const newProject = await ProjectModel.create({});
  console.log(newProject);
  return redirect(`/project/${newProject._id}`);
};

export const loader = async ({ request }) => {
  // const user = await UserModel.findOne();

  // const userProjects = [];
  // for (const organisationId of user.organisations) {
  // const organisationProjects = await ProjectModel.find({ organisation: organisationId });

  //   userProjects.push(...organisationProjects);
  // }
  const projects = await ProjectModel.find();
  return {
    projects: projects,
    // user,
  };
};

export const meta = () => {
  return [
    {
      title: `My projects | ${APP_NAME}`,
    },
  ];
};

export default function Index() {
  const { projects, user } = useLoaderData();
  const newProjectFetcher = useFetcher();

  return (
    <div className="flex h-full max-h-full w-full max-w-full flex-col overflow-hidden">
      <h1 className="m-4 text-3xl">Welcome to Roadmap, the table to make your roadmaps ! 🗺️</h1>
      <main className="relative flex flex-wrap justify-start gap-16 overflow-auto p-16">
        {projects.map((project) => (
          <div key={project._id} className="flex shrink-0 basis-1/4 flex-col justify-between">
            <div className="block max-w-sm rounded-lg bg-white p-6 drop-shadow-lg">
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
          className="flex shrink-0 basis-1/4 flex-col items-stretch justify-between"
        >
          <div className="block max-w-sm rounded-lg bg-white p-6 drop-shadow-lg">
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
