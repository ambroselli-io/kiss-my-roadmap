import { useMemo } from "react";

export const ButtonsXSToXL = ({ feature, name, featureFetcher, form, className = "", debug }) => {
  const selected = useMemo(() => {
    if (debug) {
      console.log(
        `["loading", "submitting"].includes(featureFetcher.state)`,
        ["loading", "submitting"].includes(featureFetcher.state)
      );
      console.log(
        `featureFetcher.submission?.formData?.get("featureId")`,
        featureFetcher.submission?.formData?.get("featureId")
      );
      console.log("feature?._id", feature?._id);
      console.log(featureFetcher.submission?.formData?.get("featureId") !== feature?._id);
    }
    if (["loading", "submitting"].includes(featureFetcher.state)) {
      if (featureFetcher.submission.formData?.get("featureId") !== feature._id) return feature[name];
      const newValue = featureFetcher.submission.formData?.get(name);
      if (newValue) {
        if (newValue === feature[name]) return "";
        return newValue;
      }
    }
    return feature[name];
  }, [feature, name, featureFetcher, debug]);
  if (debug) console.log("selected", selected);
  return (
    <div className={["flex flex-row gap-1 px-1 py-2", className].join(" ")}>
      <button
        className={[
          selected === "XS"
            ? "bg-green-700 text-white"
            : "border-opacity-40 bg-green-200 bg-opacity-40 text-green-700 text-opacity-40",
          "border-green-700 active:!bg-green-700 active:!text-white",
          "flex-1 rounded border-2",
        ].join(" ")}
        name={name}
        type="submit"
        form={form}
        value="XS"
      >
        XS
      </button>
      <button
        className={[
          selected === "S"
            ? "bg-green-600 text-white"
            : "border-opacity-40 bg-green-100 bg-opacity-40 text-green-600 text-opacity-40",
          "border-green-600 active:!bg-green-600 active:!text-white",
          "flex-1 rounded border-2",
        ].join(" ")}
        name={name}
        type="submit"
        form={form}
        value="S"
      >
        S
      </button>
      <button
        className={[
          selected === "M"
            ? "bg-gray-600 text-white"
            : "border-opacity-40 bg-gray-100 bg-opacity-40 text-gray-600 text-opacity-40",
          "border-gray-600 active:!bg-gray-600 active:!text-white",
          "flex-1 rounded border-2",
        ].join(" ")}
        name={name}
        type="submit"
        form={form}
        value="M"
      >
        M
      </button>
      <button
        className={[
          selected === "L"
            ? "bg-red-600 text-white"
            : "border-opacity-40 bg-red-100 bg-opacity-40 text-red-600 text-opacity-40",
          "border-red-600 active:!bg-red-600 active:!text-white",
          "flex-1 rounded border-2",
        ].join(" ")}
        name={name}
        type="submit"
        form={form}
        value="L"
      >
        L
      </button>
      <button
        className={[
          selected === "XL"
            ? "bg-red-700 text-white"
            : "border-opacity-40 bg-red-200 bg-opacity-40 text-red-700 text-opacity-40",
          "border-red-700 active:!bg-red-700 active:!text-white",
          "flex-1 rounded border-2",
        ].join(" ")}
        name={name}
        type="submit"
        form={form}
        value="XL"
      >
        XL
      </button>
    </div>
  );
};
