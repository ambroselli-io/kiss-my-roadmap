import mongoose from "mongoose";
import dbConnection from "../mongo.server";
const MODELNAME = "Feature";

const Schema = new mongoose.Schema(
  {
    content: { type: String },
    devCost: { type: String },
    businessValue: { type: String },
    occurency: { type: String },
    priority: { type: String },
    status: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

Schema.pre("find", function () {
  this.where({ deletedAt: { $exists: false } });
});

Schema.pre("findOne", function () {
  this.where({ deletedAt: { $exists: false } });
});

const FeatureModel = dbConnection.models[MODELNAME] || dbConnection.model(MODELNAME, Schema);

if (process.env.NODE_ENV === "production") {
  FeatureModel.syncIndexes();
} else {
  // global.__syncIndexes = global.__syncIndexes.filter((i) => i !== MODELNAME);
  if (!global.__syncIndexes.includes(MODELNAME)) {
    global.__syncIndexes.push(MODELNAME);
    FeatureModel.syncIndexes();
  }
}

export default FeatureModel;
