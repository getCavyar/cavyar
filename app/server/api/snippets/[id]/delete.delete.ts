import { ObjectId } from "mongodb";
import { getServerSession } from "#auth";
import { snippetsRef } from "~/server/plugins/mongodb";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const session = await getServerSession(event);

    if (!session?.user?.name) {
      return ErrorResponse.unauthorized();
    }

    const snippet = await snippetsRef.findOne({ _id: new ObjectId(id) });

    if (!snippet) {
      return ErrorResponse.notFound();
    }

    if (snippet.creator !== session.user.name) {
      return ErrorResponse.unauthorized();
    }

    await snippetsRef.deleteOne({ _id: new ObjectId(id) });

    return SuccessResponse.default();
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
