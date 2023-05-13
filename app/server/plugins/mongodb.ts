import { MongoClient, ServerApiVersion } from "mongodb";
import { Snippet } from "~~/ts/types";

const config = useRuntimeConfig();
const uri = `mongodb+srv://admin:${config.mongoPW}@snippid.pnv85sy.mongodb.net/?retryWrites=true&w=majority`;

export const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});
export const db = client.db("Snippid");
export const snippetsRef = db.collection<Snippet>("snippets");

export default defineNitroPlugin((nitroApp) => {
  try {
    client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error connecting to MongoDB", err);
  }
});
