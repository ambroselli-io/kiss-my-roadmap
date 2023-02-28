import mongoose from "mongoose";
import dbConnection from "../mongo.server";
import { availableHelp } from "~/utils/help.server";
const MODELNAME = "User";

const Schema = new mongoose.Schema(
  {
    /* profile */
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^.+@(?:[\w-]+\.)+\w+$/, "Please fill a valid email address"],
      sparse: true,
    },
    username: { type: String },
    password: { type: String },
    name: { type: String },
    job: { type: String },
    urlOrigin: { type: String },
    organisations: [
      {
        organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
        role: { type: String, enum: ["admin", "member"] },
        canCreate: { type: Boolean, default: false },
        canRead: { type: Boolean, default: false },
        canUpdate: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
      },
    ],
    helpSettings: {
      type: [],
      default: availableHelp,
    },
  },
  { timestamps: true }
);

Schema.methods.me = function () {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    organisations: this.organisations,
    helpSettings: this.helpSettings,
  };
};

const UserModel = dbConnection.models[MODELNAME] || dbConnection.model(MODELNAME, Schema);

export default UserModel;
