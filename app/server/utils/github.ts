const config = useRuntimeConfig();

export const getUserProfile = async (accessToken: string) => {
  const profileUrl = "https://api.github.com/user";
  const response = await fetch(profileUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return {
    username: data.login,
    avatarUrl: data.avatar_url,
  };
};

export const getAccessToken = async (code: string) => {
  const tokenUrl = "https://github.com/login/oauth/access_token";
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.public.githubClientId,
      client_secret: config.githubClientSecret,
      code,
    }),
  });
  const data = await response.json();
  return data.access_token;
};
