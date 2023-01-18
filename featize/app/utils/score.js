export const appendScore = (feature) => {
  const score = getScore(feature);
  return { ...feature, score };
};

export const businessValueScores = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
};

export const devCostScores = {
  XS: 5,
  S: 4,
  M: 3,
  L: 2,
  XL: 1,
};

export const getScore = (feature) => {
  const { businessValue, devCost, priority } = feature;
  if (!["XS", "S", "M", "L", "XL"].includes(devCost)) return null;
  if (!["XS", "S", "M", "L", "XL"].includes(businessValue)) return null;

  let devScore = devCostScores[devCost];
  let businessScore = businessValueScores[businessValue];

  const score = devScore * businessScore;
  if (!["YES", "NO"].includes(priority)) return score;
  if (priority === "YES") return score * 5;
  return score;
};
