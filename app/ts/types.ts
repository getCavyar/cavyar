import { ObjectId } from "mongodb";

export type SnippetFramework = "anchor" | "native" | "seahorse" | "typescript";
export type Id = string;

export type Snippet = {
  _id: ObjectId;
  creator: Id;
  title: string;
  likes: Id[];
  description: string;
  code: string;
  tags: string[];
  framework: SnippetFramework;
  createdAt: number;
  updatedAt: number | null;
  aiExplanation: string | null;
};

export type POSTSnippet = Omit<
  Snippet,
  "_id" | "createdAt" | "updatedAt" | "likes"
>;
