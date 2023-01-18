import { businessValueScores, devCostScores } from "./score";

const defaultSort = (a, b, sortOrder) =>
  sortOrder === "ASC" ? a.content.localeCompare(b.content) : b.content.localeCompare(a.content);

export const sortFeatures = (sortBy, sortOrder) => (a, b) => {
  if (sortBy === "createdAt") {
    return sortOrder === "ASC"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
  }
  if (sortBy === "businessValue") {
    if (!a.businessValue && !b.businessValue) return defaultSort(a, b, sortOrder);
    if (!a.businessValue) return sortOrder === "ASC" ? 1 : -1;
    if (!b.businessValue) return sortOrder === "DESC" ? 1 : -1;
    return sortOrder === "ASC"
      ? businessValueScores[b.businessValue] - businessValueScores[a.businessValue]
      : businessValueScores[a.businessValue] - businessValueScores[b.businessValue];
  }
  if (sortBy === "devCost") {
    if (!a.devCost && !b.devCost) return defaultSort(a, b, sortOrder);
    if (!a.devCost) return sortOrder === "ASC" ? 1 : -1;
    if (!b.devCost) return sortOrder === "DESC" ? 1 : -1;
    return sortOrder === "ASC"
      ? devCostScores[b.devCost] - devCostScores[a.devCost]
      : devCostScores[a.devCost] - devCostScores[b.devCost];
  }
  if (sortBy === "priority") {
    if (!a.priority && !b.priority) return defaultSort(a, b, sortOrder);
    if (!a.priority) return sortOrder === "ASC" ? 1 : -1;
    if (!b.priority) return sortOrder === "DESC" ? 1 : -1;
    return sortOrder === "ASC" ? a.priority.localeCompare(b.priority) : b.priority.localeCompare(a.priority);
  }
  if (sortBy === "score") {
    if (!a.score && !b.score) return defaultSort(a, b, sortOrder);
    if (!a.score) return sortOrder === "ASC" ? 1 : -1;
    if (!b.score) return sortOrder === "DESC" ? 1 : -1;
    return sortOrder === "ASC" ? b.score - a.score : a.score - b.score;
  }
  // DEFAULT SORTING
  // (sortBy === 'content')
  return defaultSort(a, b, sortOrder);
};
