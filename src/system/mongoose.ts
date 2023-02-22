import mongoose from "mongoose";
import config from "@/system/config";

export default function bootMongo() {
  mongoose.connect(config.mongo.uri);
  console.log("mongo booted");
}
