import { getAccessToken, getUserProfile } from "../../utils/github";
import { usersRef } from "~/server/plugins/mongodb";

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

  // Get User's auth session
  const session = await isAuthenticated(event);

  if (session.user?.name) {
    usersRef.updateOne(
      { publicKey: session.user.name },
      {
        $set: {
          username: userProfile.username,
          avatarUrl: userProfile.avatarUrl,
        },
      },
    );
  } else {
    return ErrorResponse.unauthorized();
  }

  return sendRedirect(event, `/users/${session.user.name}`);
});
