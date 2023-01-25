import React, { useCallback, useState } from "react";
import { Form, Link, Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import FeatureModel from "~/db/models/feature.server";
import ProjectModel from "~/db/models/project.server";
import { json, redirect } from "@remix-run/node";
import { appendScore } from "~/utils/score";
import { sortFeatures } from "~/utils/sort";
import { HelpBlock, MainHelpButton, helpAction } from "~/components/HelpBlock";
import { getUserFromCookie } from "~/services/auth.server";
import { StatusesFilter } from "~/components/Feature/StatusesFilter";
import { SortArrowButton } from "~/components/Feature/SortArrowButton";
import { SortDropDown } from "~/components/Feature/SortDropDown";
import { FeatureRow } from "~/components/Feature/FeatureRow";
import { DropdownMenu } from "~/components/DropdownMenu";
import OpenTrash from "~/components/OpenTrash";
import { FeatureCard } from "~/components/Feature/FeatureCard";

export const action = async ({ request, params }) => {
  const user = await getUserFromCookie();
  const formData = await request.formData();
  if (formData.get("action") === "sort") {
    const projectId = params.projectId;
    const project = await ProjectModel.findById(projectId);
    if (formData.get("sortBy")) project.sortBy = formData.get("sortBy");
    if (formData.get("sortOrder")) project.sortOrder = formData.get("sortOrder");
    if (!project.sortOrder) project.sortOrder = "ASC";
    await project.save();
    return json({ ok: true });
  }

  if (formData.get("action") === "filter") {
    const projectId = params.projectId;
    const project = await ProjectModel.findById(projectId);
    const statusToToggle = formData.get("status");
    if (project.filteredStatuses.includes(statusToToggle)) {
      project.filteredStatuses = project.filteredStatuses.filter((status) => status !== statusToToggle);
      project.sortedFeaturesIds = [];
    } else {
      project.filteredStatuses = [...(project.filteredStatuses || []), statusToToggle];
    }
    await project.save();
    return json({ ok: true });
  }

  if (formData.get("action") === "deleteFeature") {
    await FeatureModel.findByIdAndUpdate(formData.get("featureId"), { deletedAt: new Date(), deletedBy: user._id });
    return json({ ok: true });
  }

  if (formData.get("action") === "deleteProject") {
    console.log("delete project");
    const projectId = params.projectId;
    await ProjectModel.findByIdAndUpdate(projectId, { deletedAt: new Date(), deletedBy: user._id });
    return redirect("../");
  }

  if (formData.get("action") === "newProject") {
    const newProject = await ProjectModel.create({});
    return redirect(`/project/${newProject._id}`);
  }

  if (formData.get("action") === "updateProject") {
    const projectId = params.projectId;
    const project = await ProjectModel.findById(projectId);
    if (formData.get("title")) project.title = formData.get("title");
    if (formData.get("description")) project.description = formData.get("description");
    await project.save();
    return json({ ok: true });
  }

  if (formData.get("action") === "helpSettings") {
    await helpAction({ user, formData });
    return json({ ok: true });
  }

  if (formData.get("featureId")) {
    const feature = await FeatureModel.findById(formData.get("featureId"));
    const projectId = params.projectId;
    const project = await ProjectModel.findById(projectId);
    if (!feature) return json({ ok: false });
    if (formData.get("content")) {
      feature.content = formData.get("content");
      if (feature.content?.length > 0 && feature.status === "__new") feature.status = "";
      if (["content"].includes(project.sortBy)) project.sortBy = null;
    }
    if (formData.get("devCost")) {
      feature.devCost = formData.get("devCost") === feature.devCost ? "" : formData.get("devCost");
      if (["devCost", "score", "status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    if (formData.get("businessValue")) {
      feature.businessValue =
        formData.get("businessValue") === feature.businessValue ? "" : formData.get("businessValue");
      if (["businessValue", "score", "status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    if (formData.get("priority")) {
      feature.priority = formData.get("priority") === feature.priority ? "" : formData.get("priority");
      if (["priority", "score", "status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    if (formData.get("status")) {
      feature.status = formData.get("status") === feature.status ? "" : formData.get("status");
      if (["status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    await project.save();
    await feature.save();
    return json({ ok: true });
  }
  return json({ ok: true });
};

export const loader = async ({ request, params }) => {
  const user = await getUserFromCookie();
  const projectId = params.projectId;
  const project = await ProjectModel.findById(projectId);
  const features = await FeatureModel.find({
    project: projectId,
    status: { $nin: [...(project.filteredStatuses || []), "__new"] },
  }).lean();

  if (!project.sortedFeaturesIds || project.sortedFeaturesIds.length === 0) {
    project.sortedFeaturesIds = features.map((f) => f._id);
    await project.save();
  }

  let augmentedFeatures = project.sortedFeaturesIds
    .map((featureId) => {
      const feature = features.find((_feature) => featureId.equals(_feature._id));
      if (!feature) return null;
      return appendScore(feature);
    })
    .filter(Boolean);

  if (project.sortBy) {
    augmentedFeatures = augmentedFeatures.sort(sortFeatures(project.sortBy, project.sortOrder));
  }

  let newFeature = await FeatureModel.findOne({ project: projectId, status: "__new" }).lean();
  if (!newFeature) {
    newFeature = new FeatureModel({ project: projectId, status: "__new" });
    await newFeature.save();
  }

  augmentedFeatures.push(newFeature);

  try {
    return {
      project,
      features: augmentedFeatures,
      user,
    };
  } finally {
    project.sortedFeaturesIds = augmentedFeatures.map((f) => f._id);
    await project.save();
  }
};

export const meta = ({ data }) => {
  return [
    {
      title: `${data.project?.title || "New project"} | Froadmap`,
    },
    {
      name: "description",
      content: data.project?.description || "No description yet",
    },
    {
      name: "og:title",
      content: `${data.project?.title || "New project"} | Froadmap`,
    },
    {
      name: "og:description",
      content: data.project?.description || "No description yet",
    },
    {
      name: "twitter:title",
      content: `${data.project?.title || "New project"} | Froadmap`,
    },
    {
      name: "twitter:description",
      content: data.project?.description || "No description yet",
    },
  ];
};

export default function Index() {
  const { project, features } = useLoaderData();

  const { sortBy, sortOrder } = project;

  const submit = useSubmit();
  const onColumnClick = useCallback(
    (e) => {
      const sortkey = e.currentTarget.getAttribute("data-sortkey");
      const formData = new FormData();
      formData.append("action", "sort");
      if (sortBy === sortkey) {
        formData.append("sortOrder", sortOrder === "ASC" ? "DESC" : "ASC");
      } else {
        formData.append("sortBy", sortkey);
      }
      submit(formData, { method: "POST", replace: true });
    },
    [sortBy, sortOrder, submit]
  );

  const [editTitle, setEditTitle] = useState(!project.title);
  const submitMetadata = (e) => {
    const formData = new FormData();
    formData.append("action", "updateProject");
    formData.append(e.target.name, e.target.value);
    submit(formData, { method: "POST", replace: true });
    setEditTitle(false);
  };

  return (
    <div className="relative flex h-full max-h-full w-full max-w-full flex-col overflow-auto" key={project._id}>
      <Outlet />
      <header className="flex justify-between border-b border-gray-200 px-4 text-xs">
        <div className="flex gap-2">
          <DropdownMenu
            id="header-menu-project"
            closeOnItemClick
            title="Project"
            className="[&_.menu-container]:min-w-max"
          >
            <Form method="post" className="flex flex-col items-start">
              <Link to="/" className="inline-flex items-center gap-1">
                <div className="h-6 w-6" /> My projects
              </Link>
              <button type="submit" name="action" value="newProject" className="inline-flex items-center gap-1">
                <div className="inline-flex h-6 w-6 items-center justify-center">+</div> New project
              </button>
              <button
                type="submit"
                name="action"
                value="deleteProject"
                className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                onClick={(e) => {
                  if (!confirm("Are you sure you want to delete this project?")) {
                    e.preventDefault();
                  }
                }}
              >
                <OpenTrash className="h-6 w-6" /> Delete project
              </button>
            </Form>
          </DropdownMenu>
        </div>
        <MainHelpButton className="py-2 px-4" />
      </header>
      <main className="flex flex-1 basis-full flex-col justify-start pb-4 text-xs md:pb-8">
        <Form className="flex shrink-0 flex-col md:pb-10" onBlur={submitMetadata}>
          {editTitle ? (
            <input
              type="text"
              name="title"
              defaultValue={project.title}
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
              {project.title}
            </h1>
          )}
          <div className="flex">
            <div className="relative h-min grow">
              <div
                aria-hidden
                className="pointer-events-none invisible min-h-[5rem] py-4 px-4 md:px-12"
                placeholder="Write here the description of the project. Try to be as concise as possible, with some objectives so that the features are aligned with the project goals."
              >
                {project.description?.split("\n").map((item, key) => (
                  <span key={key}>
                    {item}
                    <br />
                  </span>
                ))}
              </div>
              <textarea
                defaultValue={project.description}
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
            <HelpBlock helpSetting="showRoadmapHelp" className="basis-1/2 !text-left !text-base">
              <p>
                Froadmap helps you optimize your product roadmap.
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
        <div className="px-4 md:hidden">
          <div className="my-1 flex items-center">
            <p className="m-0 italic">Sort by:</p>
            <SortDropDown field={sortBy} onClick={onColumnClick} sortOrder={sortOrder} sortBy={sortBy} />
          </div>
          <div className="my-1 flex items-center">
            <p className="m-0 italic">Filter by status:</p>
            <StatusesFilter />
          </div>
        </div>
        <div className="relative w-full max-w-full">
          <div
            aria-roledescription="Header of the list of features - Clicking on a column header can sort the feature by the column, ascending or descending"
            className="sticky top-0 z-50 hidden grid-cols-features md:grid"
          >
            <div className="flex items-start justify-center border-r border-l-0 border-b-2 border-gray-900 bg-white py-4"></div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton field="content" onClick={onColumnClick} sortOrder={sortOrder} sortBy={sortBy} />
                <HeaderButton title={`Features`} field="content" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton field="businessValue" onClick={onColumnClick} sortOrder={sortOrder} sortBy={sortBy} />
                <HeaderButton title={`🤑\u00A0Added\u00A0value`} field="businessValue" onClick={onColumnClick} />
              </div>
            </div>
            <div className="cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900 md:flex">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton field="devCost" onClick={onColumnClick} sortOrder={sortOrder} sortBy={sortBy} />
                <HeaderButton title={`💸\u00A0Production\u00A0cost`} field="devCost" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton field="priority" onClick={onColumnClick} sortOrder={sortOrder} sortBy={sortBy} />
                <HeaderButton title={`❗️\u00A0Priority`} field="priority" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton field="score" onClick={onColumnClick} sortOrder={sortOrder} sortBy={sortBy} />
                <HeaderButton title={`💯\u00A0Score`} field="score" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-l border-r-2 border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton field="status" onClick={onColumnClick} sortOrder={sortOrder} sortBy={sortBy} />
                <div className="flex basis-full justify-between">
                  <HeaderButton title="Status" field="status" onClick={onColumnClick} />
                  <StatusesFilter className="-my-2 hidden md:block [&_.menu-container]:right-0 [&_.menu-container]:left-[unset] [&_.menu-container]:w-[unset]" />
                </div>
              </div>
            </div>
          </div>
          {features.map((feature, index) => (
            <React.Fragment key={feature._id}>
              <FeatureRow feature={feature} index={index} className="hidden md:grid" />
              <FeatureCard feature={feature} index={index} className="md:hidden" />
            </React.Fragment>
          ))}
        </div>
      </main>
    </div>
  );
}

const HeaderButton = ({ title, field, onClick }) => {
  return (
    <button
      className="grow text-left"
      aria-label={`Sort by ${title}`}
      type="button"
      data-sortkey={field}
      onClick={onClick}
    >
      {title}
    </button>
  );
};
