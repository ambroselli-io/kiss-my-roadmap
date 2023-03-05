import { useMemo } from "react";
import { getScore } from "../../utils/score";

export const Score = ({ feature, featureFetcher, className = "" }) => {
  const score = useMemo(() => {
    if (["loading", "submitting"].includes(featureFetcher.state)) {
      if (featureFetcher.submission.formData?.get("featureId") !== feature._id) return feature.score;
      const optimisticFeature = { ...feature };
      for (const [field, value] of featureFetcher.submission.formData.entries()) {
        optimisticFeature[field] = value === feature[field] ? "" : value;
      }
      return getScore(optimisticFeature);
    }
    return feature.score;
  }, [feature, featureFetcher]);
  return (
    <p className={["flex h-full w-full items-center peer-[.help-score]:h-auto", className].join(" ")}>{score || 0}</p>
  );
};
