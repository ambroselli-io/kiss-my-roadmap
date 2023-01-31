import React, { useCallback, useEffect } from "react";
import { Outlet, useActionData, useLoaderData, useLocation, useNavigate, useSubmit } from "@remix-run/react";
import FeatureModel from "~/db/models/feature.server";
import ProjectModel from "~/db/models/project.server";
import { json, redirect } from "@remix-run/node";
import { appendScore } from "~/utils/score";
import { sortFeatures } from "~/utils/sort";
import { helpAction } from "~/components/HelpBlock";
import { getUnauthentifiedUserFromCookie, getUserFromCookie } from "~/services/auth.server";
import { StatusesFilter } from "~/components/Feature/StatusesFilter";
import { SortArrowButton } from "~/components/Feature/SortArrowButton";
import { SortDropDown } from "~/components/Feature/SortDropDown";
import { FeatureRow } from "~/components/Feature/FeatureRow";
import { FeatureCard } from "~/components/Feature/FeatureCard";
import ProjectMetadata from "~/components/ProjectMetadata";
import { action as actionLogout } from "./action.logout";
import TopMenu from "~/components/TopMenu";
import { defaultFeatures } from "~/utils/defaultFeatures.server";
import EventModel from "~/db/models/event.server";
import { usePageLoadedEvent } from "./action.event";

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const user = await getUserFromCookie(request, { failureRedirect: "/project/new-project/register" });
  const url = new URL(request.url);
  const isRegistering = url.pathname.includes("register");
  let projectId = params.projectId;
  if (formData.get("action") === "logout") {
    EventModel.create({
      event: "PROJECT LOGOUT",
      user: user._id,
      project: projectId,
    });
    return await actionLogout({ request, to: "/project/new-project/register" });
  }
  if (!projectId) {
    if (isRegistering) return;
    return redirect("/project/new-project");
  }
  if (projectId === "new-project") {
    if (isRegistering) return;
    const newProject = await ProjectModel.create({
      title: formData.get("title") || "",
      description: formData.get("description") || "",
      createdBy: user._id,
      users: [
        {
          user: user._id,
          permission: "admin",
          email: user.email,
        },
      ],
    });
    for (const feature of defaultFeatures) {
      await FeatureModel.create({
        project: newProject._id,
        createdBy: user._id,
        ...feature,
      });
    }
    EventModel.create({
      event: "PROJECT CREATE FROM TEMPLATE",
      user: user._id,
      project: newProject._id,
    });
    projectId = newProject._id;
    return redirect(`/project/${projectId}`);
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    return json({ ok: false }, { status: 404 });
  }
  if (!project.users.find((u) => user._id.equals(u.user))) {
    console.log("OK MAN");
    return json({ ok: false }, { status: 403 });
  }

  if (formData.get("action") === "sort") {
    if (formData.get("sortBy")) project.sortBy = formData.get("sortBy");
    if (formData.get("sortOrder")) project.sortOrder = formData.get("sortOrder");
    if (!project.sortOrder) project.sortOrder = "ASC";
    await project.save();
    EventModel.create({
      event: "PROJECT SORT",
      user: user._id,
      project: projectId,
      value: JSON.stringify({ sortBy: project.sortBy, sortOrder: project.sortOrder }),
    });
    return json({ ok: true });
  }

  if (formData.get("action") === "filter") {
    const statusToToggle = formData.get("status");
    if (project.filteredStatuses.includes(statusToToggle)) {
      project.filteredStatuses = project.filteredStatuses.filter((status) => status !== statusToToggle);
      project.sortedFeaturesIds = [];
    } else {
      project.filteredStatuses = [...(project.filteredStatuses || []), statusToToggle];
    }
    await project.save();
    EventModel.create({
      event: "PROJECT FILTER",
      user: user._id,
      project: projectId,
      value: JSON.stringify(project.filteredStatuses),
    });
    return json({ ok: true });
  }

  if (formData.get("action") === "deleteFeature") {
    await FeatureModel.findByIdAndUpdate(formData.get("featureId"), { deletedAt: new Date(), deletedBy: user._id });
    EventModel.create({
      event: "PROJECT DELETE FEATURE",
      user: user._id,
      project: projectId,
      feature: formData.get("featureId"),
    });
    return json({ ok: true });
  }

  if (formData.get("action") === "deleteProject") {
    await ProjectModel.findByIdAndUpdate(projectId, { deletedAt: new Date(), deletedBy: user._id });
    EventModel.create({
      event: "PROJECT DELETE PROJECT",
      user: user._id,
      project: projectId,
    });
    return redirect("../");
  }

  if (formData.get("action") === "newProject") {
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
    for (const feature of defaultFeatures) {
      await FeatureModel.create({
        project: newProject._id,
        createdBy: user._id,
        ...feature,
      });
    }
    EventModel.create({
      event: "PROJECT CREATE FROM BUTTON NEW PROJECT",
      user: user._id,
      project: newProject._id,
    });
    return redirect(`/project/${newProject._id}`);
  }

  if (formData.get("action") === "updateProject") {
    if (formData.get("title")) project.title = formData.get("title");
    if (formData.get("description")) project.description = formData.get("description");
    await project.save();
    EventModel.create({
      event: "PROJECT UPDATE METADATA",
      user: user._id,
      project: projectId,
      value: JSON.stringify({ title: project.title, description: project.description }),
    });
    return json({ ok: true });
  }

  if (formData.get("action") === "helpSettings") {
    await helpAction({ user, formData });
    return json({ ok: true });
  }

  if (formData.get("featureId")) {
    const feature = await FeatureModel.findById(formData.get("featureId"));
    if (!feature) return json({ ok: false });
    if (formData.get("content") && formData.get("content") !== feature.content) {
      feature.content = formData.get("content");
      if (feature.content?.length > 0 && feature.status === "__new") feature.status = "";
      if (["content"].includes(project.sortBy)) project.sortBy = null;
      EventModel.create({
        event: "PROJECT UPDATE FEATURE CONTENT",
        user: user._id,
        project: projectId,
        feature: feature._id,
        value: JSON.stringify(feature),
      });
    }
    if (formData.get("devCost")) {
      feature.devCost = formData.get("devCost") === feature.devCost ? "" : formData.get("devCost");
      if (["devCost", "score", "status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
      EventModel.create({
        event: `PROJECT UPDATE FEATURE DEV COST ${feature.devCost}`,
        user: user._id,
        project: projectId,
        feature: feature._id,
        value: JSON.stringify(feature),
      });
    }
    if (formData.get("businessValue")) {
      feature.businessValue =
        formData.get("businessValue") === feature.businessValue ? "" : formData.get("businessValue");
      if (["businessValue", "score", "status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
      EventModel.create({
        event: `PROJECT UPDATE FEATURE BUSINESS VALUE ${feature.businessValue}`,
        user: user._id,
        project: projectId,
        feature: feature._id,
        value: JSON.stringify(feature),
      });
    }
    if (formData.get("priority")) {
      feature.priority = formData.get("priority") === feature.priority ? "" : formData.get("priority");
      if (["priority", "score", "status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
      EventModel.create({
        event: `PROJECT UPDATE FEATURE PRIORITY ${feature.priority}`,
        user: user._id,
        project: projectId,
        feature: feature._id,
        value: JSON.stringify(feature),
      });
    }
    if (formData.get("status")) {
      feature.status = formData.get("status") === feature.status ? "" : formData.get("status");
      if (["status"].includes(project.sortBy)) {
        project.sortBy = null;
      }
      EventModel.create({
        event: `PROJECT UPDATE FEATURE STATUS ${feature.status}`,
        user: user._id,
        project: projectId,
        feature: feature._id,
        value: JSON.stringify(feature),
      });
    }
    await project.save();
    await feature.save();
    return json({ ok: true });
  }
  return json({ ok: true });
};

export const loader = async ({ request, params }) => {
  const user = await getUnauthentifiedUserFromCookie(request);

  const projectId = params.projectId;
  if (!projectId) return redirect("/project/new-project");
  if (projectId === "new-project") {
    EventModel.create({
      event: "PROJECT LOAD FROM NEW-PROJECT ID",
      user: user?._id,
    });
    return {
      project: {},
      features: [...defaultFeatures.map(appendScore), { status: "__new" }],
      user: user?.me?.(),
    };
  }
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    EventModel.create({
      event: "PROJECT NOT FOUND",
      user: user?._id,
    });
    return redirect("/project/new-project");
  }
  if (!user) {
    EventModel.create({
      event: "PROJECT LOAD WITH NO USER",
      user: user?._id,
    });
    if (!project.isPubliclyReadable) {
      return {
        project: {
          ...project?.toObject(),
          description: "",
        },
        features: [{ status: "__new" }],
        user: null,
      };
    }
  }
  if (!project.isPubliclyReadable && !project?.users?.find(({ user: userId }) => userId === user._id)) {
    return redirect("/");
  }
  const features = await FeatureModel.find({
    project: projectId,
    status: { $nin: [...(project?.filteredStatuses || []), "__new"] },
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
    EventModel.create({
      event: "PROJECT NEW FEATURE CREATED",
      user: user?._id,
    });
    newFeature = new FeatureModel({ project: projectId, status: "__new" });
    await newFeature.save();
  }

  augmentedFeatures.push(newFeature);

  try {
    return {
      project,
      features: augmentedFeatures,
      user: user?.me?.(),
    };
  } finally {
    project.sortedFeaturesIds = augmentedFeatures.map((f) => f._id);
    await project.save();
  }
};

export const meta = ({ data }) => {
  return [
    {
      title: `${data?.project?.title || "New project"} | Froadmap`,
    },
    {
      name: "description",
      content: data?.project?.description || "No description yet",
    },
    {
      name: "og:title",
      content: `${data?.project?.title || "New project"} | Froadmap`,
    },
    {
      name: "og:description",
      content: data?.project?.description || "No description yet",
    },
    {
      name: "twitter:title",
      content: `${data?.project?.title || "New project"} | Froadmap`,
    },
    {
      name: "twitter:description",
      content: data?.project?.description || "No description yet",
    },
  ];
};

export default function Index() {
  const data = useLoaderData();

  const { project, features, user } = data;

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

  // const actionData = useActionData();
  // console.log("actionData", actionData); // undefined...
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!user?._id && !!project?._id && !location.pathname.includes("register")) {
      navigate("register");
    }
  }, [project, user, navigate, location.pathname]);

  usePageLoadedEvent({
    event: "PROJECT PAGE LOADED",
    projectId: project._id,
  });

  return (
    <>
      <div className="relative flex h-full max-h-full w-full max-w-full flex-col overflow-auto" key={project._id}>
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
                  <FeatureRow feature={feature} index={index} className="hidden md:grid" />
                  <FeatureCard feature={feature} index={index} className="md:hidden" />
                </React.Fragment>
              );
            })}
          </div>
        </main>
      </div>
      <Outlet context={data} />
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
