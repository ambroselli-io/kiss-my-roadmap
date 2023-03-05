import React from "react";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { redirect } from "react-router";
import TopMenu from "../components/TopMenu";
import { defaultFeatures } from "../utils/defaultFeatures.server";
import ProjectModel from "../db/models/project.client";
import FeatureModel from "../db/models/feature.client";

export const action = async () => {
  const newProject = ProjectModel.create();
  FeatureModel.createMany(defaultFeatures.map((feature) => ({ ...feature, project: newProject._id })));
  return redirect(`/project/${newProject._id}`);
};

export const loader = async () => {
  const projects = ProjectModel.find();
  if (!projects.length) return redirect("/project/new");
  return {
    projects,
  };
};

export const meta = () => {
  return [
    {
      title: `My projects | 💋 Kiss my Roadmap`,
    },
  ];
};

export default function Projects() {
  const { projects } = useLoaderData();
  const newProjectFetcher = useFetcher();

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
        Welcome to Kiss my Roadmap, the table to make your feature's roadmaps!
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
              Click here to start a new project
              {projects.length === 0 ? " and see what Kiss my Roadmap is all about!" : "!"}
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
