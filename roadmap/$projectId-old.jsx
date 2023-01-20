import { Form, Outlet, useActionData, useLoaderData, useSearchParams } from "@remix-run/react";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";
import { TransparentSelect } from "~/components/Selects";
import Table from "~/components/Table";
import FeatureModel from "~/db/models/feature.server";
import ProjectModel from "~/db/models/project.server";
import Input from "~/components/Input";
import { json } from "@remix-run/node";

export const action = async ({ request, params }) => {
  const projectId = params.projectId;
  const formData = await request.formData();
  if (formData.get("modal") === "add-feature") {
    const feature = await FeatureModel.create({
      content: formData.get("content"),
      devCost: formData.get("devCost"),
      businessValue: formData.get("businessValue"),
      occurency: formData.get("occurency"),
      priority: formData.get("priority"),
      status: formData.get("status") ?? "new",
      project: projectId,
    });
    return redirect(`/project/${projectId}`);
  }
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
  console.log(actionData);
  const [searchParams, setSearchParams] = useSearchParams();

  const onModalsClose = () => {
    searchParams.delete("modal");
    setSearchParams(searchParams);
  };

  return (
    <div className="flex h-full max-h-full w-full max-w-full flex-col overflow-hidden">
      <Outlet />
      <header>{project.title}</header>
      <main className="relative flex-1 basis-full overflow-auto">

        <Table
          noData={
            <button
              onClick={() => {
                searchParams.append("modal", "add-feature");
                setSearchParams(searchParams);
              }}
              className="mx-auto my-20 rounded bg-black px-16 py-4 text-xl text-white"
            >
              Add a feature
            </button>
          }
          columns={[
            {
              title: "Feature",
              dataKey: "feature",
            },
            {
              title: "Development cost",
              help: `Time or money of development.\nThe less development a feature has, the best.\nValues are XS-S-M-L-XL, and could be something like:
XS: 1 hour or less / 100€ / 5 points
S: 1 to 2 hours / 200€ / 4 points
M: half a day / 400€ / 3 points
L: one day / 800€ / 2 points
XL: three days or more / 2,400€ / 1 point.\n\nExamples: sorting the table is S, integration to Trello is M, dark mode is L`,
              dataKey: "devCost",
              render: (item) => (
                  <TransparentSelect
                    options={["XS", "S", "M", "L", "XL"].map((o) => ({ label: o, value: o }))}
                    defaultValue={item.devCost}
                    onChange={}
                  />
              ),
            },
            {
              title: "Business value",
              help: `The added value of the feature for the business. \nValues are XS-S-M-L-XL, and could be something like:
XS: very low value / not important / 1 point
S: low value / not important / 2 points
M: medium value / important / 3 points
L: high value / very important / 4 points
XL: very high value / essential / 5 points.\n\nExamples: dark mode is XS, sorting the table is M, integration to Trello is XL`,
              dataKey: "businessValue",
              render: (item) => (
                <TransparentSelect
                  options={["XS", "S", "M", "L", "XL"].map((o) => ({ label: o, value: o }))}
                  defaultValue={item.businessValue}
                />
              ),
            },
            {
              title: "Occurency",
              help: `The value of the occurency for the business.\nValues are XS-S-M-L-XL, and could be something like:
Rarely: 1 point
Sometimes: 2 points
Regularly: 3 points
Often: 4 points
Very often: 5 points\n\nExamples: sorting the table is XL, integration to Trello is L, dark mode is S`,
              dataKey: "occurency",
              render: (item) => (
                <TransparentSelect
                  options={["Rarely", "Sometimes", "Regularly", "Often", "Very often"].map((o) => ({
                    label: o,
                    value: o,
                  }))}
                  defaultValue={item.occurency}
                />
              ),
            },
            {
              title: "Priority",
              help: `Sometimes the combo development cost + business value is not enough to decide the priority of a feature. Because there really is one important for other reasons (clients pression, whatever)\nValues are YES or NO, and adds a factor 25 to the algorithm calculation.`,
              dataKey: "priority",
              render: (item) => (
                <TransparentSelect
                  options={["Yes", "No"].map((o) => ({ label: o, value: o }))}
                  defaultValue={item.priority}
                />
              ),
            },
            {
              title: "Score",
              help: `This is the score of the feature, calculated with the formula: (business value + occurency) * (priority ? 25 : 1) / development cost`,
              dataKey: "score",
              render: (item) => (
                <span>
                  {Math.round(
                    ((["XS", "S", "M", "L", "XL"].indexOf(item.businessValue) +
                      1 +
                      (["Rarely", "Sometimes", "Regularly", "Often", "Very often"].indexOf(item.occurency) + 1)) *
                      (item.priority === "Yes" ? 25 : 1)) /
                      (["XS", "S", "M", "L", "XL"].indexOf(item.devCost) + 1)
                  )}
                </span>
              ),
            },
            {
              title: "Status",
              help: `In progress, done, to do, etc.`,
              dataKey: "status",
              render: (item) => (
                <TransparentSelect
                  options={["To do", "In progress", "Done"].map((o) => ({ label: o, value: o }))}
                  defaultValue={item.status}
                />
              ),
            },
          ]}
          data={features}
          rowKey="_id"
        />
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
