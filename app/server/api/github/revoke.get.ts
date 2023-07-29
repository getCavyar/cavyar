import { usersRef } from "~/server/plugins/mongodb";
import {
  getAccessToken,
  getUserProfile,
  saveEncryptedAccessToken,
  getDecryptedAccessToken,
} from "../../utils/github";

export default defineEventHandler(async (event) => {
  const session = await isAuthenticated(event);

  if (session.user?.name) {
    // Get the decrypted access token for the user
    const decryptedAccessToken = await getDecryptedAccessToken(
      session.user.name
    );

    if (decryptedAccessToken) {
      // Clear the access token from the database
      await usersRef.updateOne(
        { publicKey: session.user.name },
        {
          $unset: {
            githubAccessToken: 1, // 1 is the value to unset a field
          },
        }
      );

      return SuccessResponse.default();
    } else {
      return ErrorResponse.new(
        400,
        "Access token not found for the user.",
        null
      );
    }
  } else {
    return ErrorResponse.unauthorized();
  }
});
