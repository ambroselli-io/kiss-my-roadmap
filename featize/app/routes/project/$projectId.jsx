import { Form, Outlet, useActionData, useLoaderData, useSearchParams, useTransition } from "@remix-run/react";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";

import FeatureModel from "~/db/models/feature.server";
import ProjectModel from "~/db/models/project.server";
import Input from "~/components/Input";
import { json } from "@remix-run/node";
import { useMemo } from "react";

export const action = async ({ request, params }) => {
  const projectId = params.projectId;
  const formData = await request.formData();
  if (formData.get("featureId")) {
    const feature = await FeatureModel.findById(formData.get("featureId"));
    if (!feature) return json({ ok: false });
    if (formData.get("content")) feature.content = formData.get("content");
    if (formData.get("devCost")) feature.devCost = formData.get("devCost");
    if (formData.get("businessValue")) feature.businessValue = formData.get("businessValue");
    if (formData.get("occurency")) feature.occurency = formData.get("occurency");
    if (formData.get("priority")) feature.priority = formData.get("priority");
    if (formData.get("status")) feature.status = formData.get("status");
    await feature.save();
    return json({ ok: true });
  }
  return json({ ok: true });
  // if (formData.get("modal") === "add-feature") {
  //   const feature = await FeatureModel.create({
  //     content: formData.get("content"),
  //     devCost: formData.get("devCost"),
  //     businessValue: formData.get("businessValue"),
  //     occurency: formData.get("occurency"),
  //     priority: formData.get("priority"),
  //     status: formData.get("status") ?? "new",
  //     project: projectId,
  //   });
  //   return redirect(`/project/${projectId}`);
  // }
};

export const loader = async ({ request, params }) => {
  const projectId = params.projectId;
  const project = await ProjectModel.findById(projectId);
  const features = await FeatureModel.find({ project: projectId });
  return {
    project,
    features,
  };
};

export default function Index() {
  const { project, features } = useLoaderData();
  const actionData = useActionData();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortOrder = "ASC";
  const sortBy = "feature";

  const onModalsClose = () => {
    searchParams.delete("modal");
    setSearchParams(searchParams);
  };

  const onNameClick = (e) => {
    const sortkey = e.target.getAttribute("data-sortkey");
    if (sortBy === sortkey) {
      // onSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      // onSortBy(sortableKey);
    }
  };

  return (
    <div className="flex h-full max-h-full w-full max-w-full flex-col overflow-hidden">
      <Outlet />
      <header>{project.title}</header>
      <main className="relative flex flex-1 basis-full justify-center overflow-auto">
        <div className="relative w-full max-w-7xl">
          <div
            aria-roledescription="Header of the list of features - Clicking on a column header can sort the feature by the column, ascending or descending"
            className="sticky top-0 z-50 flex border-x-2 border-gray-900"
          >
            {/* <div className="flex-shrink-0 flex-grow-0 basis-2 cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900" /> */}
            <div className="basis-1/4 cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="feature" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Features" field="feature" onClick={onNameClick} />
            </div>
            <div className="basis-1/4 cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="businessValue" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Business value" field="businessValue" onClick={onNameClick} />
            </div>
            <div className="basis-1/4 cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="devCost" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Development cost" field="devCost" onClick={onNameClick} />
            </div>
            <div className="basis-1/4 cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="priority" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Priority" field="priority" onClick={onNameClick} />
            </div>
            <div className="basis-1/12 cursor-pointer border-y-4 border-x-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
              <SortButton field="score" onClick={onNameClick} sortOrder={sortOrder} sortBy={sortBy} />
              <HeaderButton title="Score" field="score" onClick={onNameClick} />
            </div>
          </div>
          {features.map((feature, index) => {
            return (
              <Form
                method="post"
                id={`feature-${feature._id}`}
                key={feature._id}
                aria-label={feature.content}
                className="flex border-x-2 border-gray-900"
                onChange={(e) => {
                  console.log("CHANGING");
                  e.target.form.submit();
                }}
              >
                {/* <div className="flex-shrink-0 flex-grow-0 basis-2 cursor-pointer border-x-2 border-b-4 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
                  <p className="m-0">{index}</p>
                </div> */}
                <input type="hidden" name="featureId" defaultValue={feature._id} />
                <div className="basis-1/4 cursor-pointer border-x-2 border-b-4 border-gray-900 bg-white text-left font-medium text-gray-900">
                  <input type="textarea" defaultValue={feature.content} name="content" className="h-full w-full p-4" />
                </div>
                <div className="flex basis-1/4 cursor-pointer flex-col items-stretch justify-center gap-2 border-x-2 border-b-4 border-gray-900 bg-white py-2 text-left font-medium text-gray-900">
                  <p className="break-words text-center opacity-70">
                    How much value does this feature bring to the business?
                  </p>
                  <ButtonsXSToXL name="businessValue" feature={feature} />
                </div>
                <div className="flex basis-1/4 cursor-pointer flex-col items-stretch justify-center gap-2 border-x-2 border-b-4 border-gray-900 bg-white py-2 text-left font-medium text-gray-900">
                  <p className="break-words text-center opacity-70">How much does it cost to develop this feature?</p>
                  <ButtonsXSToXL name="devCost" feature={feature} />
                </div>
                <div className="flex basis-1/4 cursor-pointer flex-col items-stretch justify-center gap-2 border-x-2 border-b-4 border-gray-900 bg-white py-2 text-left font-medium text-gray-900">
                  <p className="break-words text-center opacity-70">
                    Use this to help you prioritize your features: if you really want it, give it a YES.
                  </p>
                  <ButtonsYesNo name="priority" feature={feature} />
                </div>
                <div className="basis-1/12 cursor-pointer border-x-2 border-b-4 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
                  <span>10</span>
                </div>
              </Form>
            );
          })}
        </div>
      </main>
      <button
        onClick={() => {
          searchParams.append("modal", "add-feature");
          setSearchParams(searchParams);
        }}
        className="mx-auto my-20 rounded bg-black px-16 py-4 text-xl text-white"
      >
        Add a feature
      </button>
      <ModalContainer open={searchParams.get("modal") === "add-feature"} onClose={onModalsClose}>
        <ModalHeader title="New feature" />
        <ModalBody>
          <Form id="new-feature" className="flex flex-col p-8" method="POST">
            <input type="hidden" name="modal" value="add-feature" />
            <Input name="content" type="textarea" label="Feature" />
          </Form>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onModalsClose}
              className="mx-auto rounded border border-black bg-white px-12 py-4 text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-feature"
              onClick={onModalsClose}
              className="mx-auto rounded border border-black bg-black px-12 py-4 text-white"
            >
              Save
            </button>
          </div>
        </ModalFooter>
      </ModalContainer>
    </div>
  );
}

const HeaderButton = ({ title, field, onClick }) => {
  return (
    <button aria-label={`Sort by ${title}`} type="button" data-sortkey={field} onClick={onClick}>
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

const ButtonsXSToXL = ({ feature, name }) => {
  const transition = useTransition();
  const selected = useMemo(() => {
    if (["loading", "submitting"].includes(transition.state)) {
      if (transition.submission.formData?.get("featureId") !== feature._id) return feature[name];
      const newValue = transition.submission.formData?.get(name);
      if (newValue) return newValue;
    }
    return feature[name];
  }, [feature, name, transition]);
  return (
    <div className="flex gap-1 px-1">
      <button
        className={[
          selected === "XS" ? "bg-green-700 text-white" : "bg-green-200 text-green-700 opacity-40",
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
          selected === "S" ? "bg-green-600 text-white" : "bg-green-100 text-green-600 opacity-40",
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
          selected === "M" ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-600 opacity-40",
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
          selected === "L" ? "bg-red-600 text-white" : "bg-red-100 text-red-600 opacity-40",
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
          selected === "XL" ? "bg-red-700 text-white" : "bg-red-200 text-red-700 opacity-40",
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

const ButtonsYesNo = ({ feature, name }) => {
  const transition = useTransition();
  const selected = useMemo(() => {
    if (["loading", "submitting"].includes(transition.state)) {
      if (transition.submission.formData?.get("featureId") !== feature._id) return feature[name];
      const newValue = transition.submission.formData?.get(name);
      if (newValue) return newValue;
    }
    return feature[name];
  }, [feature, name, transition]);

  return (
    <div className="flex justify-center gap-1 px-1">
      <button
        className={[
          selected === "YES" ? "bg-green-700 text-white" : "bg-green-200 text-green-700 opacity-40",
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
          selected === "NO" ? "bg-red-700 text-white" : "bg-red-200 text-red-700 opacity-40",
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
