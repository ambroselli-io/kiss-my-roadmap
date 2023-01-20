import mongoose from "mongoose";
import dbConnection from "../mongo.server";
const MODELNAME = "User";

const Schema = new mongoose.Schema(
  {
    /* profile */
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      match: [/^.+@(?:[\w-]+\.)+\w+$/, "Please fill a valid email address"],
      sparse: true,
    },
    name: { type: String },
    job: { type: String },
    urlOrigin: { type: String },
    organisations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organisation" }],
    // devCostsSettings: {
    //   type: {
    //     scale: { type: [String], enum: [
    //       ["XS", "S", "M", "L", "XL"],
    //       ["XS", "S", "M", "L", "XL", "XXL"],
    //     ] },
    //     equivalentHours: { type: [Number] },
    //     equivalentPrice: { type: [Number] },
    //   },
    //   default: {
    //     scale: ["XS", "S", "M", "L", "XL"],
    //     equivalentHours: [1, 4, 8, 20, 40],
    //     equivalentPrice: [100, 400, 800, 2000, 4000],
    //   },
    // },
  },
  { timestamps: true }
);

Schema.methods.me = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    job: this.job,
    organisations: this.organisations,
  };
};

const UserModel = dbConnection.models[MODELNAME] || dbConnection.model(MODELNAME, Schema);

if (process.env.NODE_ENV === "production") {
  Schema.index({ email: "text" });
  UserModel.syncIndexes();
} else {
  // global.__syncIndexes = global.__syncIndexes.filter((i) => i !== MODELNAME);
  if (!global.__syncIndexes.includes(MODELNAME)) {
    global.__syncIndexes.push(MODELNAME);
    Schema.index({ email: "text" });
    UserModel.syncIndexes();
  }
}

export default UserModel;
