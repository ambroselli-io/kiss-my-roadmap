import { useMemo } from "react";

export const ButtonsYesNo = ({ feature, name, form, featureFetcher }) => {
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
    <div className="flex flex-row justify-center gap-1 px-1 py-2">
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
        form={form}
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
        form={form}
        value="NO"
      >
        NO
      </button>
    </div>
  );
};
