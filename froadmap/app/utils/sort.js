import { businessValueScores, devCostScores } from "./score";

const defaultSort = (a, b, sortOrder) => {
  if (!a.score && !b.score) {
    sortOrder === "ASC" ? a.content.localeCompare(b.content) : b.content.localeCompare(a.content);
  }
  if (!a.score) return sortOrder === "ASC" ? 1 : -1;
  if (!b.score) return sortOrder === "DESC" ? 1 : -1;
  return sortOrder === "ASC" ? b.score - a.score : a.score - b.score;
};

const statusSort = {
  TODO: 1,
  INPROGRESS: 2,
  DONE: 3,
  NOTREADYYET: 4,
  KO: 5,
};

export const sortFeatures =
  (sortBy = "", sortOrder = "ASC") =>
  (a, b) => {
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
    if (sortBy === "status") {
      if (!statusSort[a.status] && !statusSort[b.status]) return defaultSort(a, b, sortOrder);
      if (!statusSort[a.status]) return sortOrder === "ASC" ? 1 : -1;
      if (!statusSort[b.status]) return sortOrder === "DESC" ? 1 : -1;
      if (statusSort[a.status] === statusSort[b.status]) return defaultSort(a, b, sortOrder);
      return sortOrder === "ASC"
        ? statusSort[a.status] - statusSort[b.status]
        : statusSort[b.status] - statusSort[a.status];
    }
    if (sortBy === "content") {
      return sortOrder === "ASC" ? a.content.localeCompare(b.content) : b.content.localeCompare(a.content);
    }
    // DEFAULT SORTING
    // (sortBy === 'score')
    return defaultSort(a, b, sortOrder);
  };
