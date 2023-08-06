import { ObjectId } from "mongodb";
import { getServerSession } from "#auth";
import { snippetsRef } from "~/server/plugins/mongodb";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const session = await isAuthenticated(event);

    const result = await snippetsRef.deleteOne({
      _id: new ObjectId(id),
      creator: session.user!.name!,
    });

    if (result.deletedCount === 0) {
      return ErrorResponse.notFound();
    }

    return SuccessResponse.default();
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
