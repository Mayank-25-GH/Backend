import mongoose from "mongoose";
import { User } from "./user.models";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //one whom is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //one whom to subscriber is subscribing
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
