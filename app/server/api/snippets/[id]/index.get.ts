import { ObjectId } from "mongodb";
import { snippetsRef } from "~~/server/plugins/mongodb";
import { Snippet } from "~~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;

    if (!id) {
      throw ErrorResponse.new(400, DefaultResponses.InvalidRequest, null);
    }

    const snippet = await snippetsRef.findOne({ _id: new ObjectId(id) });

    if (!snippet) {
      throw ErrorResponse.notFound();
    }

    return SuccessResponse.new<Snippet>(
      200,
      "Operation was successful",
      snippet
    );
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
