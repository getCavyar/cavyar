import { Connection } from "@solana/web3.js";
import { SnippetFramework } from "./types";

export const connection = new Connection("https://rpc.cavyar.io", "processed");

export const frameworks = [
  {
    name: "anchor" as SnippetFramework,
    language: "rust",
    icon: `${process.env.BASE_URL}/icons/anchor.png`,
  },
  {
    name: "native" as SnippetFramework,
    language: "rust",
    icon: `${process.env.BASE_URL}/icons/solana.png`,
  },
  {
    name: "seahorse" as SnippetFramework,
    language: "python",
    icon: `${process.env.BASE_URL}/icons/seahorse.jpeg`,
  },
  {
    name: "typescript" as SnippetFramework,
    language: "typescript",
    icon: `${process.env.BASE_URL}/icons/typescript.webp`,
  },
];
