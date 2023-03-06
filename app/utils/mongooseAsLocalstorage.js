import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

const withTimestamps = (data, isSoftDeleting = false) => {
  if (!data.createdAt) {
    data.createdAt = dayjs();
  }
  data.updatedAt = dayjs();
  if (isSoftDeleting) {
    data.deletedAt = dayjs();
  }
  return data;
};

const handleQuery = (query) => (item) => {
  if (item.deletedAt) return false;
  const keys = Object.keys(query);
  for (const key of keys) {
    if (typeof query[key] === "string") {
      if (Array.isArray(item[key])) {
        if (!item[key].includes(query[key])) {
          return false;
        }
      }
      if (item[key] !== query[key]) {
        return false;
      }
    } else if (typeof query[key] === "object") {
      if (query[key].$in) {
        if (Array.isArray(item[key])) {
          if (!item[key].some((item) => query[key].$in.includes(item))) {
            return false;
          }
        }
        if (!query[key].$in.includes(item[key])) {
          return false;
        }
      }
      if (query[key].$nin) {
        if (Array.isArray(item[key])) {
          if (item[key].some((item) => query[key].$nin.includes(item))) {
            return false;
          }
        }
        if (query[key].$nin.includes(item[key])) {
          return false;
        }
      }
    }
  }
  return true;
};

export const mongooseAsLocalstorage = (modelName, schema) => {
  return {
    findById: (id) => {
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const item = allData.find((item) => item._id === id);
      return item;
    },
    findOne: (query = {}) => {
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const item = allData.find(handleQuery(query));
      return item;
    },
    findByIdAndUpdate: (id, data) => {
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const item = allData.find((item) => item._id === id);
      if (!item) return null;
      const updatedItem = withTimestamps({
        ...item,
        ...data,
      });
      const updatedData = allData.map((item) => {
        if (item._id === id) {
          return updatedItem;
        }
        return item;
      });
      window.localStorage.setItem(modelName, JSON.stringify(updatedData));
      return updatedItem;
    },
    countDocuments: (query = {}) => {
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const items = allData.filter(handleQuery(query));
      return items.length;
    },
    find: (query = {}) => {
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const items = allData.filter(handleQuery(query));
      return items;
    },
    create: (data) => {
      const newData = withTimestamps({
        ...data,
        _id: uuidv4(),
      });
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const updatedData = [...allData, newData];
      window.localStorage.setItem(modelName, JSON.stringify(updatedData));
      return newData;
    },
    createMany: (data) => {
      const newData = data.map((item) =>
        withTimestamps({
          ...item,
          _id: uuidv4(),
        })
      );
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const updatedData = [...allData, ...newData];
      window.localStorage.setItem(modelName, JSON.stringify(updatedData));
      return newData;
    },
    updateMany: (query, data) => {
      const allData = JSON.parse(window.localStorage.getItem(modelName) || "[]");
      const updatedData = allData.map((item) => {
        if (!handleQuery(query)(item)) return item;
        return withTimestamps({
          ...item,
          ...data,
        });
      });
      window.localStorage.setItem(modelName, JSON.stringify(updatedData));
      return updatedData;
    },
  };
};
