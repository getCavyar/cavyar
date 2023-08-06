import type ObjectId from "bson-objectid";

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
