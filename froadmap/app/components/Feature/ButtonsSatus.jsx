import { useMemo } from "react";

export const ButtonsSatus = ({ feature, name = "status", featureFetcher }) => {
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
