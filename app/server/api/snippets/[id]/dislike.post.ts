import { ObjectId } from "mongodb";
import { snippetsRef } from "~/server/plugins/mongodb";
import { Snippet } from "~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;

    const session = await isAuthenticated(event);

    if (session.user?.name === undefined || session.user?.name === null) {
      throw ErrorResponse.unauthorized();
    }

    const snippet = await snippetsRef.findOne({ _id: new ObjectId(id) });
    if (snippet?.dislikes?.includes(session.user.name)) {
      await snippetsRef.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { dislikes: session.user.name, likes: session.user.name } }
      );
    } else {
      await snippetsRef.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { dislikes: session.user.name },
          $pull: { likes: session.user.name },
        }
      );
    }

    const updatedSnippet = await snippetsRef.findOne({ _id: new ObjectId(id) });

    if (updatedSnippet === null) {
      return ErrorResponse.notFound();
    }
    return SuccessResponse.new<Snippet>(
      200,
      "Operation successful",
      updatedSnippet
    );
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
