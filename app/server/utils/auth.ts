import { getServerSession } from "#auth";

export const isAuthenticated = async (event: any) => {
  const session = await getServerSession(event);

  if (!session || !session.user?.name) {
    throw ErrorResponse.unauthorized();
  }

  return session;
};
