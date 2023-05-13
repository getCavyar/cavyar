import type ObjectId from "bson-objectid";

export type SnippetLanguage = "anchor" | "seahorse" | "web3.js";
export type Id = string;

export type Snippet = {
  _id: ObjectId;
  creator: Id;
  title: string;
  description: string;
  code: string;
  tags: string[];
  framework: SnippetLanguage;
  createdAt: number;
  updatedAt: number | null;
  aiExplanation: string | null;
  //TODO
  // likes: number;
};
