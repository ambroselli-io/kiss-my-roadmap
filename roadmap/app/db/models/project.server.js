import mongoose from "mongoose";
import dbConnection from "../mongo.server";
const MODELNAME = "Project";

const Schema = new mongoose.Schema(
  {
    title: { type: String },
    slug: { type: String },
    description: { type: String },
    organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
    sortBy: { type: String, default: "" },
    sortOrder: { type: String, enum: ["ASC", "DESC", ""], default: "" },
    sortedFeaturesIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feature" }],
  },
  { timestamps: true }
);

Schema.methods.me = function () {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    organisation: this.organisation,
    sortBy: this.sortBy,
    sortOrder: this.sortOrder,
    sortedFeaturesIds: this.sortedFeaturesIds,
  };
};

const ProjectModel = dbConnection.models[MODELNAME] || dbConnection.model(MODELNAME, Schema);

if (process.env.NODE_ENV === "production") {
  ProjectModel.syncIndexes();
} else {
  // global.__syncIndexes = global.__syncIndexes.filter((i) => i !== MODELNAME);
  if (!global.__syncIndexes.includes(MODELNAME)) {
    global.__syncIndexes.push(MODELNAME);
    ProjectModel.syncIndexes();
  }
}

export default ProjectModel;
