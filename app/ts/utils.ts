export const getAvatar = (seed: string): string => {
  return `https://api.dicebear.com/6.x/identicon/svg?rowColor=005d63&backgroundColor=052426&backgroundType=gradientLinear&seed=${seed}`;
};

export const shortenPublicKey = (publicKey: string): string => {
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
};

export const signInWithGithub = (githubClientId: string) => {
  const redirectUri = `${process.env.BASE_URL}/api/github/callback`;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}`;
  window.location.href = authUrl;
};
