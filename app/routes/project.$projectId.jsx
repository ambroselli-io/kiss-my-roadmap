import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Outlet, useLoaderData, useLocation, useNavigate, json, redirect } from "react-router";
import { useFetchers, useSubmit } from "react-router-dom";
import { appendScore } from "../utils/score";
import { sortFeatures } from "../utils/sort";
import { helpAction } from "../components/HelpBlock";
import { StatusesFilter } from "../components/Feature/StatusesFilter";
import { SortArrowButton } from "../components/Feature/SortArrowButton";
import { SortDropDown } from "../components/Feature/SortDropDown";
import { FeatureRow } from "../components/Feature/FeatureRow";
import { FeatureCard } from "../components/Feature/FeatureCard";
import ProjectMetadata from "../components/ProjectMetadata";
import TopMenu from "../components/TopMenu";
import { defaultFeatures } from "../utils/defaultFeatures.server";
import OnboardModal from "../components/OnboardModal";
import ProjectModel from "../db/models/project.client";
import FeatureModel from "../db/models/feature.client";

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  let projectId = params.projectId;
  if (!projectId) {
    return redirect("/project/new-project");
  }
  if (projectId === "new-project") {
    const newProject = ProjectModel.create({
      title: formData.get("title") || "",
      description: formData.get("description") || "",
    });
    FeatureModel.createMany(
      defaultFeatures.map((feature) => ({
        project: newProject._id,
        ...feature,
      }))
    );
    projectId = newProject._id;
    return redirect(`/project/${projectId}`);
  }

  const project = ProjectModel.findById(projectId);
  if (!project) {
    return json({ ok: false }, { status: 404 });
  }

  if (formData.get("action") === "sort") {
    if (formData.get("sortBy")) project.sortBy = formData.get("sortBy");
    if (formData.get("sortOrder")) project.sortOrder = formData.get("sortOrder");
    if (!project.sortOrder) project.sortOrder = "ASC";
    ProjectModel.findByIdAndUpdate(project._id, project);
    return json({ ok: true });
  }

  if (formData.get("action") === "filter") {
    const statusToToggle = formData.get("status");
    if (project.filteredStatuses?.includes(statusToToggle)) {
      project.filteredStatuses = project.filteredStatuses.filter((status) => status !== statusToToggle);
      project.sortedFeaturesIds = [];
    } else {
      project.filteredStatuses = [...(project.filteredStatuses || []), statusToToggle];
    }
    ProjectModel.findByIdAndUpdate(project._id, project);
    return json({ ok: true });
  }

  if (formData.get("action") === "deleteFeature") {
    FeatureModel.findByIdAndUpdate(formData.get("featureId"), { deletedAt: new Date() });
    return json({ ok: true });
  }

  if (formData.get("action") === "deleteProject") {
    ProjectModel.findByIdAndUpdate(projectId, { deletedAt: new Date() });
    FeatureModel.updateMany({ project: projectId }, { deletedAt: new Date() });
    return redirect("../");
  }

  if (formData.get("action") === "newProject") {
    const newProject = ProjectModel.create();
    FeatureModel.createMany(
      defaultFeatures.map((feature) => ({
        project: newProject._id,
        ...feature,
      }))
    );
    return redirect(`/project/${newProject._id}`);
  }

  if (formData.get("action") === "updateProject") {
    if (formData.get("title")) project.title = formData.get("title");
    if (formData.get("description")) project.description = formData.get("description");
    ProjectModel.findByIdAndUpdate(project._id, project);
    return json({ ok: true });
  }

  if (formData.get("action") === "helpSettings") {
    await helpAction({ formData });
    return json({ ok: true });
  }

  if (formData.get("featureId")) {
    const feature = FeatureModel.findById(formData.get("featureId"));
    if (!feature) return json({ ok: false });
    if (formData.get("content") && formData.get("content") !== feature.content) {
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
    ProjectModel.findByIdAndUpdate(project._id, project);
    FeatureModel.findByIdAndUpdate(feature._id, feature);
    return json({ ok: true });
  }
  return json({ ok: true });
};

export const loader = async ({ request, params }) => {
  const projectId = params.projectId;
  if (!projectId) return redirect("/project/new-project");
  if (projectId === "new-project") {
    return {
      project: {},
      features: [...defaultFeatures.map(appendScore), { status: "__new" }],
    };
  }
  const project = ProjectModel.findById(projectId);
  if (!project) {
    return redirect("/project/new-project");
  }

  const features = FeatureModel.find({
    project: projectId,
    status: { $nin: [...(project?.filteredStatuses || []), "__new"] },
  });

  if (!project.sortedFeaturesIds || project.sortedFeaturesIds.length === 0) {
    project.sortedFeaturesIds = features.map((f) => f._id);
    ProjectModel.findByIdAndUpdate(project._id, project);
  }

  let augmentedFeatures = project.sortedFeaturesIds
    .map((featureId) => {
      const feature = features.find((_feature) => featureId === _feature._id);
      if (!feature) return null;
      return appendScore(feature);
    })
    .filter(Boolean);

  if (project.sortBy) {
    augmentedFeatures = augmentedFeatures.sort(sortFeatures(project.sortBy, project.sortOrder));
  }

  let newFeature = FeatureModel.findOne({ project: projectId, status: "__new" });
  if (!newFeature) {
    newFeature = FeatureModel.create({ project: projectId, status: "__new" });
  }

  augmentedFeatures.push(newFeature);

  try {
    return {
      project,
      features: augmentedFeatures,
    };
  } finally {
    project.sortedFeaturesIds = augmentedFeatures.map((f) => f._id);
    ProjectModel.findByIdAndUpdate(project._id, project);
  }
};

export const meta = ({ data }) => {
  return [
    {
      title: `${data?.project?.title || "New project"} | 💋 Kiss my Roadmap`,
    },
    {
      name: "description",
      content: data?.project?.description || "No description yet",
    },
    {
      name: "og:title",
      content: `${data?.project?.title || "New project"} | 💋 Kiss my Roadmap`,
    },
    {
      name: "og:description",
      content: data?.project?.description || "No description yet",
    },
    {
      name: "twitter:title",
      content: `${data?.project?.title || "New project"} | 💋 Kiss my Roadmap`,
    },
    {
      name: "twitter:description",
      content: data?.project?.description || "No description yet",
    },
  ];
};

export default function ProjectId() {
  const data = useLoaderData();
  const fetchers = useFetchers();
  const { project } = data;

  const featuresAdded = useRef(null);
  const features = useMemo(() => {
    let isSubmittingNewFeature = false;
    for (const fetcher of fetchers) {
      if (fetcher?.formData?.get("action") === "createFeature") {
        isSubmittingNewFeature = fetcher?.formData?.get("content")?.trim?.()?.length > 0;
        break;
      }
    }
    if (isSubmittingNewFeature) {
      featuresAdded.current = true;
      return [...data.features, { _id: "optimistic-new-feature-id", status: "__new" }];
    }
    return data.features;
  }, [fetchers, data.features]);

  const featuresContainer = useRef(null);
  useEffect(() => {
    if (featuresAdded.current && features[features.length - 1]?._id === "optimistic-new-feature-id") {
      // smooth scroll window to bottom
      setTimeout(() => {
        featuresContainer.current.scrollTo({ top: featuresContainer.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [features]);

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

  return (
    <>
      <div
        ref={featuresContainer}
        className="relative flex h-full max-h-full w-full max-w-full flex-col overflow-auto"
        key={project._id}
      >
        <TopMenu />
        <main className="flex flex-1 basis-full flex-col justify-start pb-4 text-xs md:pb-8">
          <ProjectMetadata />
          <div className={["px-4 md:hidden", features?.length <= 1 ? "invisible" : ""].join(" ")}>
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
                  <SortArrowButton
                    field="businessValue"
                    onClick={onColumnClick}
                    sortOrder={sortOrder}
                    sortBy={sortBy}
                  />
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
            {features.map((feature, index) => {
              return (
                <React.Fragment key={feature._id || index}>
                  <FeatureRow
                    allowScrollToNewFeature={featuresAdded.current}
                    feature={feature}
                    index={index}
                    className="hidden md:grid"
                  />
                  <FeatureCard
                    allowScrollToNewFeature={featuresAdded.current}
                    feature={feature}
                    index={index}
                    className="md:hidden"
                  />
                </React.Fragment>
              );
            })}
          </div>
        </main>
      </div>
      <Outlet context={data} />
      <OnboardModal />
    </>
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
