import { snippetsRef } from "~/server/plugins/mongodb";
import { Snippet } from "~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const pubKey = event.context.params?.user;

    const userSnippets = await snippetsRef
      .find({
        creator: pubKey,
      })
      .toArray();

    return SuccessResponse.new<Snippet[]>(
      200,
      "Operation was successful",
      userSnippets
    );
  } catch (error) {
    console.log(error);
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
