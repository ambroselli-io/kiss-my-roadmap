import { mongooseAsLocalstorage } from "../../utils/mongooseAsLocalstorage";

const FeatureModel = mongooseAsLocalstorage("Feature", {
  content: { type: "String" },
  devCost: { type: "String" },
  businessValue: { type: "String" },
  occurency: { type: "String" },
  priority: { type: "String" },
  status: { type: "String" },
  project: { type: "String", ref: "Project" },
  createdAt: { type: "Date" },
  updatedAt: { type: "Date" },
  deletedAt: { type: "Date" },
  deletedBy: { type: "String", ref: "User" },
});

export default FeatureModel;
