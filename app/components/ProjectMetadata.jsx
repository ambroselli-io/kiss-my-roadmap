import React, { useMemo, useState } from "react";
import { Form, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import ProjectModel from "~/db/models/project.server";
import HelpBlock from "./HelpBlock";

export const action = async ({ formData, projectId }) => {
  if (formData.get("action") === "updateProject") {
    const project = await ProjectModel.findById(projectId);
    if (formData.get("title")) project.title = formData.get("title");
    if (formData.get("description")) project.description = formData.get("description");
    await project.save();
    return true;
  }
};

const ProjectMetadata = () => {
  const { project } = useLoaderData();
  const transition = useTransition();

  const submit = useSubmit();

  const [editTitle, setEditTitle] = useState(!project.title);
  const submitMetadata = (e) => {
    if (String(e.target.value || "") === String(project[e.target.name] || "")) return;
    const formData = new FormData(e.target.form);
    formData.append("action", "updateProject");
    submit(formData, { method: "POST", replace: true });
    setEditTitle(false);
  };

  const { title, description } = useMemo(() => {
    if (!["loading", "submitting"].includes(transition.state)) return project || {};
    if (transition.submission?.formData?.get("action") !== "updateProject") return project || {};
    return {
      title: transition.submission?.formData?.get("title") ?? project?.title,
      description: transition.submission?.formData?.get("description") ?? project?.description,
    };
  }, [project, transition.state, transition.submission?.formData]);

  return (
    <Form className="mt-0.5 flex shrink-0 flex-col md:pb-10" onBlur={submitMetadata} id="project-metadata">
      {editTitle || !project.title ? (
        <input
          type="text"
          name="title"
          autoFocus={!project.title}
          defaultValue={title}
          className="p-4 text-4xl font-bold md:p-8"
          placeholder="Write here the title of your project. 🐉"
        />
      ) : (
        <h1
          className="cursor-pointer p-4 text-4xl font-bold md:p-8"
          onClick={() => {
            setEditTitle(true);
          }}
        >
          {title}
        </h1>
      )}
      <div className="mt-0.5 flex flex-col md:flex-row">
        <div className="relative h-min grow">
          <div
            aria-hidden
            className="pointer-events-none invisible min-h-[5rem] py-4 px-4 md:px-12"
            placeholder="Write here the description of the project. Try to be as concise as possible, with some objectives so that the features are aligned with the project goals."
          >
            {description?.split("\n").map((item, key) => (
              <span key={key}>
                {item}
                <br />
              </span>
            ))}
          </div>
          <textarea
            defaultValue={description}
            name="description"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitMetadata(e);
              }
            }}
            className="absolute inset-0 h-full min-h-[5rem] w-full py-4 px-4 md:px-12"
            placeholder="Write here the description of the project. Try to be as concise as possible, with some objectives so that the features are aligned with the project goals."
          />
        </div>
        <HelpBlock helpSetting="showRoadmapHelp" className="!block basis-1/2 !text-left !text-base">
          <p className="mb-2 text-xs italic md:hidden">
            Note: the UX should be much better on desktop screens - table-based compared to card-based
          </p>
          <h6 className="font-bold text-gray-600 !opacity-100">
            💋 Welcome to Kiss my Roadmap! What are you dealing with here?
          </h6>
          <p>
            Kiss my Roadmap helps you optimize your product's features roadmap.
            <br />
            I know, there are plenty of tools out there, but this one is different.
            <br />
            The secret of this template: KISS 💋. In other words: Keep It Simple, Stupid.
          </p>
          <strong>
            <ul className="list-inside list-disc">
              By keeping things simple, you can go fast on:
              <li>listing the features you can build</li>
              <li>which one are really worth it</li>
              <li>which one you should build first</li>
              <li>iterate cleverly on your product.</li>
            </ul>
          </strong>
          <p>
            Last but not least: don't build too much! At least not at the beginning of your journey. Don't forget to
            launch your product, make users appreciate your features, and iterate on it.
          </p>
        </HelpBlock>
      </div>
    </Form>
  );
};

export default ProjectMetadata;
