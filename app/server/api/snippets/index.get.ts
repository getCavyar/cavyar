import { ObjectId } from "mongodb";
import { client } from "~~/server/plugins/mongodb";
import { snippetsRef } from "~~/server/plugins/mongodb";
import { Snippet } from "~~/ts/types";

export default defineEventHandler(async (event) => {
  const snippets = await snippetsRef.find({}).toArray();

  return {
    snippets,
  };
});
