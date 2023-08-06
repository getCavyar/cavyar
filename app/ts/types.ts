import { ObjectId } from "mongodb";

export type SnippetFramework = "anchor" | "native" | "seahorse" | "typescript";
export type Id = string;

// TODO include creator avatar in http request
export type Snippet = {
  _id: ObjectId;
  creator: Id;
  title: string;
  likes: Id[];
  dislikes: Id[];
  description: string;
  code: string;
  tags: string[];
  framework: SnippetFramework;
  createdAt: number;
  updatedAt: number | null;
  aiExplanation: string | null;
};

export type User = {
  _id: ObjectId;
  username: string | null;
  publicKey: string;
  avatarUrl: string;
  bookmarks: Id[];
  createdAt: number;
};

export type POSTSnippet = Omit<
  Snippet,
  "_id" | "createdAt" | "updatedAt" | "likes" | "aiExplanation"
>;

export type DiscoveryResponse = {
  topSnippets: Snippet[];
  recentSnippets: Snippet[];
};
