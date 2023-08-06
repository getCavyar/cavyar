/* eslint-disable no-console */
import { MongoClient, ServerApiVersion } from "mongodb";
import { Snippet, User } from "~~/ts/types";

const config = useRuntimeConfig();
const uri = `mongodb+srv://admin:${config.mongoPW}@snippid.pnv85sy.mongodb.net/?retryWrites=true&w=majority`;

export const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});
export const db = client.db("Snippid");
export const snippetsRef = db.collection<Snippet>("snippets");
export const usersRef = db.collection<User>("users");

export default defineNitroPlugin(() => {
  try {
    client.connect();
    console.log("🌲 Connected to MongoDB");
  } catch (err) {
    console.log("🚨 Error connecting to MongoDB", err);
  }
});
