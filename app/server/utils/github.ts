import { RuntimeConfig } from "nuxt/schema";
import { encrypt, decrypt } from "./encryption"; // Replace with actual encryption functions
import { usersRef } from "../plugins/mongodb";

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

export const saveEncryptedAccessToken = async (
  publicKey: string,
  githubAccessToken: string
) => {
  const encryptedToken = encrypt(githubAccessToken); // Encrypt the token before saving
  await usersRef.updateOne(
    { publicKey }, // Assuming the publicKey field in the database represents the user identifier
    {
      $set: {
        githubAccessToken: encryptedToken,
      },
    }
  );
};

export const getDecryptedAccessToken = async (
  publicKey: string
): Promise<string | null> => {
  const user = await usersRef.findOne({ publicKey });
  if (user && user.githubAccessToken) {
    const decryptedToken = decrypt(user.githubAccessToken); // Decrypt the token when needed
    return decryptedToken;
  }
  return null;
};
