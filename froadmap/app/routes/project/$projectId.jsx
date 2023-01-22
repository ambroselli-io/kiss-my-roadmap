import { Form, Outlet, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import FeatureModel from "~/db/models/feature.server";
import ProjectModel from "~/db/models/project.server";
import { json } from "@remix-run/node";
import { useMemo, useCallback } from "react";
import { appendScore, getScore } from "~/utils/score";
import { sortFeatures } from "~/utils/sort";
import OpenTrash from "~/components/OpenTrash";
import { HelpBlock, MainHelpButton, helpAction } from "~/components/HelpBlock";
import { getUserFromCookie } from "~/services/auth.server";

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

  if (formData.get("action") === "deleteFeature") {
    await FeatureModel.findByIdAndDelete(formData.get("featureId"));
    return json({ ok: true });
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
      if (["devCost", "score"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    if (formData.get("businessValue")) {
      feature.businessValue =
        formData.get("businessValue") === feature.businessValue ? "" : formData.get("businessValue");
      if (["businessValue", "score"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    if (formData.get("priority")) {
      feature.priority = formData.get("priority") === feature.priority ? "" : formData.get("priority");
      if (["priority", "score"].includes(project.sortBy)) {
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
  const features = await FeatureModel.find({ project: projectId, status: { $ne: "__new" } }).lean();

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
      title: `${data.project?.title || "New project"} | Roadmap`,
    },
    {
      name: "description",
      content: data.project?.description || "No description yet",
    },
    {
      name: "og:title",
      content: `${data.project?.title || "New project"} | Roadmap`,
    },
    {
      name: "og:description",
      content: data.project?.description || "No description yet",
    },
    {
      name: "twitter:title",
      content: `${data.project?.title || "New project"} | Roadmap`,
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
  const onNameClick = useCallback(
    (e) => {
      const sortkey = e.currentTarget.getAttribute("data-sortkey");
      console.log(sortkey);
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

  const submitMetadata = (e) => {
    const formData = new FormData();
    formData.append("action", "updateProject");
    formData.append(e.target.name, e.target.value);
    submit(formData, { method: "POST", replace: true });
  };

  return (
    <div className="relative flex h-full max-h-full w-full max-w-full flex-col overflow-auto">
      <Outlet />
      <header className="flex justify-end px-8 py-2">
        <MainHelpButton />
      </header>
      <main className="flex flex-1 basis-full flex-col justify-start pb-8 text-xs">
        <Form className="flex shrink-0 flex-col pb-10" onBlur={submitMetadata}>
          <input
            type="text"
            name="title"
            defaultValue={project.title}
            className="p-8 text-4xl font-bold"
            placeholder="Write here the title of your project. 🐉"
          />
          <div className="flex">
            <div className="relative h-min grow">
              <div
                aria-hidden={true}
                className="pointer-events-none invisible min-h-[5rem] py-4 px-12"
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
                className="absolute inset-0 h-full min-h-[5rem] w-full py-4 px-12"
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
        <div className="relative w-full max-w-full">
          <div
            aria-roledescription="Header of the list of features - Clicking on a column header can sort the feature by the column, ascending or descending"
            className="sticky top-0 z-50 grid grid-cols-features"
          >
            <div className="flex items-start justify-center border-r border-l-0 border-b-2 border-gray-900 bg-white py-4"></div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <SortButton field="feature" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Features" field="feature" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <SortButton field="businessValue" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title={`🤑 Added value`} field="businessValue" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <SortButton field="devCost" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title={`💸 Production cost`} field="devCost" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <SortButton field="priority" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title={`❗️ Priority`} field="priority" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <SortButton field="score" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title={`💯\u00A0Score`} field="score" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-2 border-l border-r-2 border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <SortButton field="status" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Status" field="status" onClick={onNameClick} />
            </div>
          </div>
          {features.map((feature, index) => (
            <Feature key={feature._id} feature={feature} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}

const Feature = ({ feature, index }) => {
  const featureFetcher = useFetcher();

  if (
    featureFetcher?.submission?.formData?.get("featureId") === feature._id &&
    featureFetcher?.submission?.formData?.get("action") === "deleteFeature"
  ) {
    return null;
  }

  return (
    <featureFetcher.Form
      method="post"
      replace
      reloadDocument={false}
      id={`feature-${feature._id}`}
      key={feature._id}
      aria-label={feature.content}
      className="group grid grid-cols-features"
    >
      {/* <div className="flex-shrink-0 flex-grow-0 basis-2 cursor-pointer border-x border-b-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
                  <p className="m-0">{index}</p>
                </div> */}
      <input type="hidden" name="featureId" defaultValue={feature._id} />
      <div className="flex flex-col items-center justify-between border-r border-l-4 border-b-2 border-gray-900 py-4">
        {index + 1}
        {/* <button
          type="submit"
          name="action"
          value="deleteFeature"
          className="opacity-0 transition-all group-hover:opacity-100"
        >
          <OpenTrash className="h-8 w-8 text-red-700" />
        </button> */}
      </div>
      <div className="cursor-pointer border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        <textarea
          defaultValue={feature.content}
          placeholder={
            feature.status === "__new" ? "You can type in a new feature here" : "Mmmmh it looks like you're pivoting..."
          }
          name="content"
          className="h-full w-full p-1"
          onBlur={(e) => {
            featureFetcher.submit(e.target.form, { method: "post", replace: false });
          }}
        />
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        {feature.status !== "__new" && (
          <>
            {index === 0 && (
              <HelpBlock helpSetting="showBusinessValueHelp">
                <p>
                  How much value does <wbr /> this feature bring? Is it really useful? For a lot of users? Will it make
                  more people <wbr /> pay for your product?
                  <br />
                  High value: XL (5 points)
                  <br />
                  Low value: XS (1 point)
                </p>
              </HelpBlock>
            )}
            <ButtonsXSToXL name="businessValue" feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        {feature.status !== "__new" && (
          <>
            {index === 0 && (
              <HelpBlock helpSetting="showDevCostHelp">
                <p>
                  Every feature has its trade off. Building new stuff is never free. How much does it cost to develop
                  this feature?
                  <br />
                  High cost: XL (1 point)
                  <br />
                  Low cost: XS (5 points)
                </p>
              </HelpBlock>
            )}
            <ButtonsXSToXL name="devCost" feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        {feature.status !== "__new" && (
          <>
            {index === 0 && (
              <HelpBlock helpSetting="showPriorityHelp">
                <p>
                  Use this to help you prioritize your features: if you really want it, whatever cost/value, give it a
                  YES. It will multiply the score by 5.
                </p>
              </HelpBlock>
            )}
            <ButtonsYesNo name="priority" feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
      <div className="border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        {feature.status !== "__new" && (
          <>
            {index === 0 && (
              <HelpBlock helpSetting="showScoreHelp" className="help-score peer">
                <p>
                  Simple formula: business value + production cost. The higher the score, the more you should build it.
                  If you toggle the priority, the score will be multiplied by 5.
                </p>
              </HelpBlock>
            )}
            <Score feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-l border-r-2 border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        {feature.status !== "__new" && (
          <>
            <ButtonsSatus name="status" feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
    </featureFetcher.Form>
  );
};

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

const SortButton = ({ field, onClick, sortOrder, sortBy }) => {
  if (sortBy !== field) return null;
  return (
    <button className="mr-2" onClick={onClick} type="button" aria-label="Changer l'ordre de tri" data-sortkey={field}>
      <span>
        {sortOrder === "ASC" && `\u00A0\u2193`}
        {sortOrder === "DESC" && `\u00A0\u2191`}
      </span>
    </button>
  );
};

const ButtonsXSToXL = ({ feature, name, featureFetcher }) => {
  const selected = useMemo(() => {
    if (["loading", "submitting"].includes(featureFetcher.state)) {
      if (featureFetcher.submission.formData?.get("featureId") !== feature._id) return feature[name];
      const newValue = featureFetcher.submission.formData?.get(name);
      if (newValue) {
        if (newValue === feature[name]) return "";
        return newValue;
      }
    }
    return feature[name];
  }, [feature, name, featureFetcher]);

  return (
    <div className="flex gap-1 px-1 py-2">
      <button
        className={[
          selected === "XS"
            ? "bg-green-700 text-white"
            : "border-opacity-40 bg-green-200 bg-opacity-40 text-green-700 text-opacity-40",
          "active:!bg-green-700 active:!text-white",
          "flex-1 rounded border-2 border-green-700",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="XS"
      >
        XS
      </button>
      <button
        className={[
          selected === "S"
            ? "bg-green-600 text-white"
            : "border-opacity-40 bg-green-100 bg-opacity-40 text-green-600 text-opacity-40",
          "active:!bg-green-600 active:!text-white",
          "flex-1 rounded border-2 border-green-600",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="S"
      >
        S
      </button>
      <button
        className={[
          selected === "M"
            ? "bg-gray-600 text-white"
            : "border-opacity-40 bg-gray-100 bg-opacity-40 text-gray-600 text-opacity-40",
          "active:!bg-gray-600 active:!text-white",
          "flex-1 rounded border-2 border-gray-600",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="M"
      >
        M
      </button>
      <button
        className={[
          selected === "L"
            ? "bg-red-600 text-white"
            : "border-opacity-40 bg-red-100 bg-opacity-40 text-red-600 text-opacity-40",
          "active:!bg-red-600 active:!text-white",
          "flex-1 rounded border-2 border-red-600",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="L"
      >
        L
      </button>
      <button
        className={[
          selected === "XL"
            ? "bg-red-700 text-white"
            : "border-opacity-40 bg-red-200 bg-opacity-40 text-red-700 text-opacity-40",
          "active:!bg-red-700 active:!text-white",
          "flex-1 rounded border-2 border-red-700",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="XL"
      >
        XL
      </button>
    </div>
  );
};

const ButtonsYesNo = ({ feature, name, featureFetcher }) => {
  const selected = useMemo(() => {
    if (["loading", "submitting"].includes(featureFetcher.state)) {
      if (featureFetcher.submission.formData?.get("featureId") !== feature._id) return feature[name];
      const newValue = featureFetcher.submission.formData?.get(name);
      if (newValue) {
        if (newValue === feature[name]) return "";
        return newValue;
      }
    }
    return feature[name];
  }, [feature, name, featureFetcher]);

  return (
    <div className="flex justify-center gap-1 px-1 py-2">
      <button
        className={[
          selected === "YES"
            ? "bg-green-700 text-white"
            : "border-opacity-40 bg-green-200 bg-opacity-40 text-green-700 text-opacity-40",
          "active:!bg-green-700 active:!text-white",
          "basis-1/4 rounded border-2 border-green-700",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="YES"
      >
        YES
      </button>
      <button
        className={[
          selected === "NO"
            ? "bg-red-700 text-white"
            : "border-opacity-40 bg-red-200 bg-opacity-40 text-red-700 text-opacity-40",
          "active:!bg-red-700 active:!text-white",
          "basis-1/4 rounded border-2 border-red-700",
          selected === "" ? "hidden" : "",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="NO"
      >
        NO
      </button>
    </div>
  );
};

const ButtonsSatus = ({ feature, name, featureFetcher }) => {
  const selected = useMemo(() => {
    if (["loading", "submitting"].includes(featureFetcher.state)) {
      if (featureFetcher.submission.formData?.get("featureId") !== feature._id) return feature[name];
      const newValue = featureFetcher.submission.formData?.get(name);
      if (newValue) {
        if (newValue === feature[name]) return "";
        return newValue;
      }
    }
    return feature[name];
  }, [feature, name, featureFetcher]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-1">
      <button
        className={[
          selected === "TODO" ? "bg-blue-700 text-white" : "",
          "active:!bg-blue-700 active:!text-white",
          "rounded-full border-2 border-blue-700 px-6",
          selected === "" ? "border-opacity-40 bg-blue-200 bg-opacity-40 text-blue-700 text-opacity-40" : "",
          !["", "TODO"].includes(selected) ? "hidden" : "",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="TODO"
      >
        To do
      </button>
      <button
        className={[
          selected === "INPROGRESS" ? "bg-yellow-300 text-white" : "",
          "active:!bg-yellow-300 active:!text-white",
          "rounded-full border-2 border-yellow-400 px-6",
          selected === "" ? "border-opacity-40 bg-yellow-100 bg-opacity-40 text-gray-500 text-opacity-40" : "",
          !["", "INPROGRESS"].includes(selected) ? "hidden" : "",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="INPROGRESS"
      >
        In progress
      </button>
      <button
        className={[
          selected === "NOTREADYYET" ? "bg-red-500 text-white" : "",
          "active:!bg-red-500 active:!text-white",
          "rounded-full border-2 border-red-500 px-6",
          selected === "" ? "border-opacity-40 bg-red-200 bg-opacity-40 text-red-700 text-opacity-40" : "",
          !["", "NOTREADYYET"].includes(selected) ? "hidden" : "",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="NOTREADYYET"
      >
        Not ready yet
      </button>
      <button
        className={[
          selected === "DONE" ? "bg-green-700 text-white" : "",
          "active:!bg-green-700 active:!text-white",
          "rounded-full border-2 border-green-700 px-6",
          selected === "" ? "border-opacity-40 bg-green-200 bg-opacity-40 text-green-700 text-opacity-40" : "",
          !["", "DONE"].includes(selected) ? "hidden" : "",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="DONE"
      >
        Done
      </button>
      <button
        className={[
          selected === "KO" ? "bg-gray-900 text-white" : "",
          "active:!bg-gray-900 active:!text-white",
          "rounded-full border-2 border-gray-900 px-6",
          selected === "" ? "border-opacity-40 bg-white bg-opacity-40 text-gray-900 text-opacity-40" : "",
          !["", "KO"].includes(selected) ? "hidden" : "",
        ].join(" ")}
        name={name}
        type="submit"
        form={`feature-${feature._id}`}
        value="KO"
      >
        KO
      </button>
    </div>
  );
};

const Score = ({ feature, featureFetcher }) => {
  const score = useMemo(() => {
    if (["loading", "submitting"].includes(featureFetcher.state)) {
      if (featureFetcher.submission.formData?.get("featureId") !== feature._id) return feature.score;
      const optimisticFeature = { ...feature };
      for (const [field, value] of featureFetcher.submission.formData.entries()) {
        optimisticFeature[field] = value === feature[field] ? "" : value;
      }
      return getScore(optimisticFeature);
    }
    return feature.score;
  }, [feature, featureFetcher]);
  return <p className="flex h-full w-full items-center justify-center peer-[.help-score]:h-auto">{score}</p>;
};
