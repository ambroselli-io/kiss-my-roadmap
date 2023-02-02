import { useFetcher, useLoaderData } from "@remix-run/react";
import HelpBlock from "../HelpBlock";
import OpenTrash from "../OpenTrash";
import { Score } from "./Score";
import { ButtonsSatus } from "./ButtonsSatus";
import { ButtonsYesNo } from "./ButtonsYesNo";
import { ButtonsXSToXL } from "./ButtonsXSToXL";

export const FeatureRow = ({ feature, index, className }) => {
  const featureRowFetcher = useFetcher();
  const data = useLoaderData();
  const { project } = data;

  const formId = `feature-row-${feature._id}`;

  if (
    featureRowFetcher?.submission?.formData?.get("featureId") === feature._id &&
    featureRowFetcher?.submission?.formData?.get("action") === "deleteFeature"
  ) {
    return null;
  }

  return (
    <featureRowFetcher.Form
      method="post"
      replace
      reloadDocument={false}
      id={formId}
      key={feature._id}
      aria-label={feature.content}
      className={[
        "group grid grid-cols-features",
        feature.status === "__new" ? "[&_button]:pointer-events-none" : "",
        className,
      ].join(" ")}
    >
      {/* <div className="flex-shrink-0 flex-grow-0 basis-2 cursor-pointer border-x border-b-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900">
                  <p className="m-0">{index}</p>
                </div> */}
      <input type="hidden" name="featureId" form={formId} defaultValue={feature._id} />
      <div className="flex flex-col items-center justify-between border-r border-l-2 border-b-2 border-gray-900 pt-1">
        {index + 1}
        <button
          type="submit"
          name="action"
          value="deleteFeature"
          onClick={(e) => {
            if (!confirm("Are you sure you want to delete this feature?")) e.preventDefault();
          }}
          className="opacity-0 transition-all group-hover:opacity-100"
        >
          {feature.status !== "__new" && <OpenTrash className="h-6 w-8 text-red-700" />}
        </button>
      </div>
      <div className="cursor-pointer border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        <textarea
          defaultValue={feature.content}
          placeholder={
            feature.status === "__new" ? "You can type in a new feature here" : "Mmmmh it looks like you're pivoting..."
          }
          name="content"
          form={formId}
          autoFocus={
            !!project?.title?.length && (feature._id === "optimistic-new-feature-id" || feature.status === "__new")
          }
          className="h-full w-full p-1"
          onBlur={(e) => {
            const form = new FormData(e.target.form);
            if (feature.status === "__new") form.append("action", "createFeature");
            featureRowFetcher.submit(form, { method: "post", replace: false });
          }}
          onKeyDown={(e) => {
            if (e.key !== "ArrowDown") return;
            if (feature.status !== "__new") return;
            if (!e.target.value.length) return;
            if (e.target.selectionStart !== e.target.value.length) return;
            e.preventDefault();
            e.target.blur();
          }}
        />
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        <>
          {index === 0 && (
            <HelpBlock helpSetting="showBusinessValueHelp" className="mb-auto">
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
          <ButtonsXSToXL form={formId} name="businessValue" feature={feature} featureFetcher={featureRowFetcher} />
        </>
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        <>
          {index === 0 && (
            <HelpBlock helpSetting="showDevCostHelp" className="mb-auto">
              <p>
                Every feature has its trade off. Building new stuff is never free. How much does it cost to develop this
                feature?
                <br />
                High cost: XL (1 point)
                <br />
                Low cost: XS (5 points)
              </p>
            </HelpBlock>
          )}
          <ButtonsXSToXL form={formId} name="devCost" feature={feature} featureFetcher={featureRowFetcher} />
        </>
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        <>
          {index === 0 && (
            <HelpBlock helpSetting="showPriorityHelp" className="help-priority mb-auto">
              <p>
                If you decided that you'd do the feature anyway soon, if you really want it whatever cost/value, give it
                a YES.
                <br />
                It will multiply the score by 5.
              </p>
            </HelpBlock>
          )}
          <ButtonsYesNo form={formId} name="priority" feature={feature} featureFetcher={featureRowFetcher} />
        </>
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-x border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        <>
          {index === 0 && (
            <HelpBlock helpSetting="showScoreHelp" className="help-score peer mb-auto">
              <p>
                Simple formula: business value + production cost. The higher the score, the more you should build it. If
                you toggle the priority, the score will be multiplied by 5.
              </p>
            </HelpBlock>
          )}
          <Score feature={feature} featureFetcher={featureRowFetcher} className="justify-center py-2" />
        </>
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 border-l border-r-2 border-b-2 border-gray-900 bg-white text-left font-medium text-gray-900">
        <ButtonsSatus form={formId} feature={feature} featureFetcher={featureRowFetcher} />
      </div>
    </featureRowFetcher.Form>
  );
};
