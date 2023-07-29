import { usersRef } from "~/server/plugins/mongodb";
import { User } from "~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const pubKey = event.context.params?.user;

    const userProfile = await usersRef.find({ publicKey: pubKey }).toArray();

    if (userProfile.length === 0) {
      return ErrorResponse.new(404, "User not found", null);
    }

    return SuccessResponse.new<User>(
      200,
      "Operation was successful",
      userProfile[0]
    );
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
