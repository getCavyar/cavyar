import { usersRef } from "~/server/plugins/mongodb";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const session = await isAuthenticated(event);

    if (!session?.user?.name) {
      return ErrorResponse.unauthorized();
    }

    // Check if the snippet id is in the "bookmarks" array
    const user = await usersRef.findOne({
      publicKey: session.user.name,
      bookmarks: { $in: [id] },
    });

    if (user) {
      await usersRef.updateOne(
        {
          publicKey: session.user.name,
        },
        { $pull: { bookmarks: id } },
      );
    } else {
      // If the userId is not present in the "bookmarks" array, add it
      await usersRef.updateOne(
        {
          publicKey: session.user.name,
        },
        { $push: { bookmarks: id } },
      );
    }

    return SuccessResponse.default();
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
