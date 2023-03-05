import { mongooseAsLocalstorage } from "../../utils/mongooseAsLocalstorage";

const ProjectModel = mongooseAsLocalstorage("Project", {
  title: { type: String },
  slug: { type: String },
  description: { type: String },
  featuresHeader: { type: String },
  devCostHeader: { type: String },
  businessValueHeader: { type: String },
  priorityHeader: { type: String },
  scoreHeader: { type: String },
  sortBy: { type: String, default: "" },
  sortOrder: { type: String, enum: ["ASC", "DESC", ""], default: "" },
  sortedFeaturesIds: [{ type: String, ref: "Feature" }],
  filteredStatuses: { type: [String], default: [] },
  deletedAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

export default ProjectModel;
