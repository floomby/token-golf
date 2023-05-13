import mongoose from "mongoose";
import { ConnectionStates } from "mongoose";
import { env } from "~/env.mjs";

let connection: typeof mongoose | null = null;
const poolsize = 10;

export default async () => {
  if (
    connection === null ||
    (connection.connection.readyState !== ConnectionStates.connected &&
      connection.connection.readyState !== ConnectionStates.connecting)
  ) {
    console.log("[MONGOOSE] Creating New Connection");

    mongoose.connection.on("open", () => {
      console.log(`[MONGOOSE] Connected with poolSize ${poolsize}`);
    });

    try {
      await mongoose.connect(env.MONGODB_URI, {});
      mongoose.set("bufferTimeoutMS", 2500);
    } catch (err) {
      console.log("Mongoose connection error", err);
    }
    connection = mongoose;
    return;
  } else {
    return;
  }
};
