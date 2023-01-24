import { useFetcher } from "@remix-run/react";
import OpenTrash from "../OpenTrash";
import { Score } from "./Score";
import { ButtonsSatus } from "./ButtonsSatus";
import { ButtonsYesNo } from "./ButtonsYesNo";
import { ButtonsXSToXL } from "./ButtonsXSToXL";
import { useState } from "react";

export const FeatureCard = ({ feature, index, className }) => {
  const [showTrash, setShowTrash] = useState(false);

  const featureCardFetcher = useFetcher();
  const formId = `feature-card-${feature._id}`;

  if (
    featureCardFetcher?.submission?.formData?.get("featureId") === feature._id &&
    featureCardFetcher?.submission?.formData?.get("action") === "deleteFeature"
  ) {
    return null;
  }

  return (
    <featureCardFetcher.Form
      method="post"
      replace
      reloadDocument={false}
      id={formId}
      key={feature._id}
      aria-label={feature.content}
      onClick={() => {
        setShowTrash((t) => !t);
      }}
      className={[
        "relative m-4  transform-cpu border-2 border-gray-900 bg-white transition-all hover:scale-105",
        feature.status === "__new" ? "[&_button]:pointer-events-none" : "",
        className,
      ].join(" ")}
    >
      {/* <div className="flex-shrink-0 flex-grow-0 basis-2 cursor-pointer  bg-white p-4 text-left font-medium text-gray-900">
                  <p className="m-0">{index}</p>
                </div> */}
      <input type="hidden" name="featureId" form={formId} defaultValue={feature._id} />
      <div className="absolute top-2 right-0 flex items-center justify-end pt-1">
        <button
          type="submit"
          name="action"
          value="deleteFeature"
          onClick={(e) => {
            if (!confirm("Are you sure you want to delete this feature?")) e.preventDefault();
          }}
          className={["opacity-0 transition-all", showTrash ? "opacity-100" : ""].join(" ")}
        >
          {feature.status !== "__new" && <OpenTrash className="h-6 w-8 text-red-700" />}
        </button>
      </div>
      <div className="mt-2 cursor-pointer bg-white text-left font-medium text-gray-900">
        <textarea
          defaultValue={feature.content}
          placeholder={
            feature.status === "__new" ? "You can type in a new feature here" : "Mmmmh it looks like you're pivoting..."
          }
          name="content"
          form={formId}
          className={["h-full w-full p-1", feature.status === "__new" ? "" : "font-bold focus:font-normal"].join(" ")}
          onBlur={(e) => {
            featureCardFetcher.submit(e.target.form, { method: "post", replace: false });
          }}
        />
      </div>
      <div className="mx-1 flex items-center justify-between gap-2 bg-white text-left font-medium text-gray-900">
        <h4>{`🤑\u00A0Added\u00A0value`}:</h4>
        <ButtonsXSToXL
          form={formId}
          name="businessValue"
          feature={feature}
          featureFetcher={featureCardFetcher}
          className="grow"
        />
      </div>
      <div className="mx-1 flex items-center justify-between gap-2 bg-white text-left font-medium text-gray-900">
        <h4>{`💸\u00A0Production\u00A0cost`}:</h4>
        <ButtonsXSToXL
          form={formId}
          name="devCost"
          feature={feature}
          featureFetcher={featureCardFetcher}
          className="grow"
        />
      </div>
      <div className="mx-1 flex items-center justify-between gap-2 bg-white text-left font-medium text-gray-900">
        <h4>{`❗️\u00A0Priority`}:</h4>
        <ButtonsYesNo form={formId} name="priority" feature={feature} featureFetcher={featureCardFetcher} />
      </div>
      <div className="mx-1 flex items-center justify-between gap-2 bg-white text-left font-medium text-gray-900">
        {`💯\u00A0Score`}
        <Score feature={feature} featureFetcher={featureCardFetcher} className="my-2 justify-end" />
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 bg-white text-left font-medium text-gray-900">
        <ButtonsSatus form={formId} feature={feature} featureFetcher={featureCardFetcher} className="justify-center" />
      </div>
    </featureCardFetcher.Form>
  );
};
