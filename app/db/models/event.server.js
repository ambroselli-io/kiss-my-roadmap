import mongoose from "mongoose";
import dbConnection from "../mongo.server";
const MODELNAME = "Event";

const Schema = new mongoose.Schema(
  {
    event: { type: String },
    value: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    feature: { type: mongoose.Schema.Types.ObjectId, ref: "Feature" },
  },
  { timestamps: true }
);

Schema.methods.me = function () {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
  };
};

const EventModel = dbConnection.models[MODELNAME] || dbConnection.model(MODELNAME, Schema);

export default EventModel;
