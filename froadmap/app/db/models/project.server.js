import mongoose from "mongoose";
import dbConnection from "../mongo.server";
const MODELNAME = "Project";

const Schema = new mongoose.Schema(
  {
    title: { type: String },
    slug: { type: String },
    description: { type: String },
    featuresHeader: { type: String },
    devCostHeader: { type: String },
    businessValueHeader: { type: String },
    priorityHeader: { type: String },
    scoreHeader: { type: String },
    organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
    sortBy: { type: String, default: "" },
    sortOrder: { type: String, enum: ["ASC", "DESC", ""], default: "" },
    sortedFeaturesIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feature" }],
    filteredStatuses: { type: [String], default: [] },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    users: [
      {
        type: {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          permission: { type: String, enum: ["read", "write", "admin"] },
          email: { type: String },
        },
      },
    ],
  },
  { timestamps: true }
);

Schema.pre("find", function () {
  this.where({ deletedAt: { $exists: false } });
});

Schema.pre("findOne", function () {
  this.where({ deletedAt: { $exists: false } });
});

Schema.methods.me = function () {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    organisation: this.organisation,
    sortBy: this.sortBy,
    sortOrder: this.sortOrder,
    sortedFeaturesIds: this.sortedFeaturesIds,
    filteredStatuses: this.filteredStatuses,
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
