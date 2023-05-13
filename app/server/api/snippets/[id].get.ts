import { ObjectId } from "mongodb";
import { client } from "~~/server/plugins/mongodb";
import { snippetsRef } from "~~/server/plugins/mongodb";
import { Snippet } from "~~/ts/types";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    return ErrorResponse.new(400, DefaultResponses.InvalidRequest, null);
  }

  const snippet = await snippetsRef.findOne({ _id: new ObjectId(id) });

  return snippet;
});
