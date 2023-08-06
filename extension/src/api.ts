import axios from "axios";
import { BASE_URL } from "./constants";
import type { Snippet } from "./types";

export async function querySnippets(query: string): Promise<{
  data: Snippet[];
  statusCode: number;
  message: string;
}> {
  const response = await axios.get(`${BASE_URL}/api/snippets?query=${query}`);
  const json = await response.data;
  return json;
}

export const getDiscoverySnippets = async (): Promise<{
  topSnippets: Snippet[];
  recentSnippets: Snippet[];
}> => {
  const response = await axios.get(`${BASE_URL}/api/snippets?discovery=true`);
  const json = await response.data;
  return json.data;
};
