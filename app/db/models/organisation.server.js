import mongoose from "mongoose";
import dbConnection from "../mongo.server";
const MODELNAME = "Organisation";

const Schema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
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

const OrganisationModel = dbConnection.models[MODELNAME] || dbConnection.model(MODELNAME, Schema);

export default OrganisationModel;
