import { useMemo } from "react";

export const ButtonsXSToXL = ({ feature, name, featureFetcher }) => {
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
