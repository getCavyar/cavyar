import { usersRef } from "~/server/plugins/mongodb";
import {
  getAccessToken,
  getUserProfile,
  saveEncryptedAccessToken,
} from "../../utils/github";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event) as {
    code: string;
  };

  if (!code) {
    return ErrorResponse.default();
  }

  // Exchange authorization code for access token
  const accessToken = await getAccessToken(code);

  // Fetch user's profile information
  const userProfile = await getUserProfile(accessToken);

  const session = await isAuthenticated(event);

  if (session.user?.name) {
    const userId = session.user.name;

    // Save the encrypted access token in the database
    await saveEncryptedAccessToken(userId, accessToken);

    usersRef.updateOne(
      { publicKey: session.user.name },
      {
        $set: {
          username: userProfile.username,
          avatarUrl: userProfile.avatarUrl,
        },
      }
    );
  } else {
    return ErrorResponse.unauthorized();
  }

  return sendRedirect(event, "/");
});
