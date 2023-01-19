import { Form, Outlet, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import FeatureModel from "~/db/models/feature.server";
import ProjectModel from "~/db/models/project.server";
import { json } from "@remix-run/node";
import { useMemo, useCallback } from "react";
import { appendScore, getScore } from "~/utils/score";
import { sortFeatures } from "~/utils/sort";
import OpenTrash from "~/components/OpenTrash";

export const action = async ({ request, params }) => {
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
      feature.devCost = formData.get("devCost");
      if (["devCost", "score"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    if (formData.get("businessValue")) {
      feature.businessValue = formData.get("businessValue");
      if (["businessValue", "score"].includes(project.sortBy)) {
        project.sortBy = null;
      }
    }
    if (formData.get("priority")) {
      feature.priority = formData.get("priority");
      if (["priority", "score"].includes(project.sortBy)) {
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
    };
  } finally {
    project.sortedFeaturesIds = augmentedFeatures.map((f) => f._id);
    await project.save();
  }
};

export default function Index() {
  const { project, features } = useLoaderData();

  const { sortBy, sortOrder } = project;

  const submit = useSubmit();
  const onNameClick = useCallback(
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

  const submitMetadata = (e) => {
    const formData = new FormData();
    formData.append("action", "updateProject");
    formData.append(e.target.name, e.target.value);
    submit(formData, { method: "POST", replace: true });
  };

  return (
    <div className="relative flex h-full max-h-full w-full max-w-full flex-col overflow-auto">
      <Outlet />
      <main className="flex flex-1 basis-full flex-col justify-center pb-8">
        <Form className="flex shrink-0 flex-col pb-10" onBlur={submitMetadata}>
          <input
            type="text"
            name="title"
            defaultValue={project.title}
            className="p-8 text-4xl font-bold"
            placeholder="Write here the title of your project. 🐉"
          />
          <div className="relative h-min">
            <div
              contentEditable
              name="description"
              className="pointer-events-none invisible py-4 px-12"
              placeholder="Write here the description of the project. Try to be as concise as possible, with some objectives so that the features are aligned with the project goals."
            >
              {project.description.split("\n").map((item, key) => (
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
              className="absolute inset-0 h-full py-4 px-12"
              placeholder="Write here the description of the project. Try to be as concise as possible, with some objectives so that the features are aligned with the project goals."
            />
          </div>
        </Form>
        <div className="relative w-full max-w-full">
          <div
            aria-roledescription="Header of the list of features - Clicking on a column header can sort the feature by the column, ascending or descending"
            className="sticky top-0 z-50 grid grid-cols-features"
          >
            <div className="flex items-start justify-center border-l-0 border-r-2 border-b-4 border-gray-900 bg-white py-4"></div>
            <div className="flex cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="feature" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Features" field="feature" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="businessValue" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Business value" field="businessValue" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="devCost" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Development cost" field="devCost" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="priority" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Priority" field="priority" onClick={onNameClick} />
            </div>
            <div className="flex cursor-pointer border-y-4 border-l-2 border-r-4 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="score" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Score" field="score" onClick={onNameClick} />
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
      {/* <div className="flex-shrink-0 flex-grow-0 basis-2 cursor-pointer border-x-2 border-b-4 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
                  <p className="m-0">{index}</p>
                </div> */}
      <input type="hidden" name="featureId" defaultValue={feature._id} />
      <div className="flex flex-col items-center justify-between border-l-4 border-r-2 border-b-4 border-gray-900 py-4">
        {index + 1}
        <button
          type="submit"
          name="action"
          value="deleteFeature"
          className="opacity-0 transition-all group-hover:opacity-100"
        >
          <OpenTrash className="h-8 w-8 text-red-700" />
        </button>
      </div>
      <div className="shrink-1 grow-0 basis-1/3 cursor-pointer border-x-2 border-b-4 border-gray-900 bg-white text-left font-medium text-gray-900">
        <textarea
          type="textarea"
          defaultValue={feature.content}
          placeholder={
            feature.status === "__new" ? "You can type in a new feature here" : "Mmmmh it looks like you're pivoting..."
          }
          name="content"
          className="h-full min-h-max w-full p-4"
          onBlur={(e) => {
            featureFetcher.submit(e.target.form, { method: "post", replace: false });
          }}
        />
      </div>
      <div className="shrink-1 flex grow-0 basis-1/4 flex-col items-stretch justify-center gap-2 border-x-2 border-b-4 border-gray-900 bg-white py-2 text-left font-medium text-gray-900">
        {feature._id !== "new" && (
          <>
            <p className="break-words text-center opacity-70">
              How much value does this feature bring to the business?
            </p>
            <ButtonsXSToXL name="businessValue" feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
      <div className="shrink-1 flex grow-0 basis-1/4 flex-col items-stretch justify-center gap-2 border-x-2 border-b-4 border-gray-900 bg-white py-2 text-left font-medium text-gray-900">
        {feature._id !== "new" && (
          <>
            <p className="break-words text-center opacity-70">How much does it cost to develop this feature?</p>
            <ButtonsXSToXL name="devCost" feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
      <div className="shrink-1 flex grow-0 basis-1/4 flex-col items-stretch justify-center gap-2 border-x-2 border-b-4 border-gray-900 bg-white py-2 text-left font-medium text-gray-900">
        {feature._id !== "new" && (
          <>
            <p className="break-words text-center opacity-70">
              Use this to help you prioritize your features: if you really want it, give it a YES.
            </p>
            <ButtonsYesNo name="priority" feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
      <div className="shrink-1 grow-0 basis-1/12 border-l-2 border-r-4 border-b-4 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
        {feature._id !== "new" && (
          <>
            <Score feature={feature} featureFetcher={featureFetcher} />
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
    <button onClick={onClick} type="button" aria-label="Changer l'ordre de tri" data-sortkey={field}>
      <span className="mr-4">
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
      if (newValue) return newValue;
    }
    return feature[name];
  }, [feature, name, featureFetcher]);

  return (
    <div className="flex gap-1 px-1">
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
      if (newValue) return newValue;
    }
    return feature[name];
  }, [feature, name, featureFetcher]);

  return (
    <div className="flex justify-center gap-1 px-1">
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

const Score = ({ feature, featureFetcher }) => {
  const score = useMemo(() => {
    if (["loading", "submitting"].includes(featureFetcher.state)) {
      if (featureFetcher.submission.formData?.get("featureId") !== feature._id) return feature.score;
      const optimisticFeature = { ...feature };
      for (const [field, value] of featureFetcher.submission.formData.entries()) {
        optimisticFeature[field] = value;
      }
      return getScore(optimisticFeature);
    }
    return feature.score;
  }, [feature, featureFetcher]);
  return <span>{score}</span>;
};
