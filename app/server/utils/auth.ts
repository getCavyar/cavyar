import { getServerSession } from "#auth";

export const isAuthenticated = async (event: any) => {
  const session = await getServerSession(event);

  if (!session) {
    throw ErrorResponse.unauthorized();
  }

  return session;
};
