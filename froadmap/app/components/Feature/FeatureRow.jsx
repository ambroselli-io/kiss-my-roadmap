import { useFetcher } from "@remix-run/react";
import HelpBlock from "../HelpBlock";
import OpenTrash from "../OpenTrash";
import { Score } from "./Score";
import { ButtonsSatus } from "./ButtonsSatus";
import { ButtonsYesNo } from "./ButtonsYesNo";
import { ButtonsXSToXL } from "./ButtonsXSToXL";

export const FeatureRow = ({ feature, index }) => {
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
      <div className="flex flex-col items-center justify-between border-r border-l-4 border-b-2 border-gray-900 pt-1">
        {index + 1}
        <button
          type="submit"
          name="action"
          value="deleteFeature"
          className="opacity-0 transition-all group-hover:opacity-100"
        >
          <OpenTrash className="h-6 w-8 text-red-700" />
        </button>
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
              <HelpBlock helpSetting="showPriorityHelp" className="help-priority">
                <p>
                  If you decided that you'd do the feature anyway soon, if you really want it whatever cost/value, give
                  it a YES.
                  <br />
                  It will multiply the score by 5.
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
            <ButtonsSatus feature={feature} featureFetcher={featureFetcher} />
          </>
        )}
      </div>
    </featureFetcher.Form>
  );
};
