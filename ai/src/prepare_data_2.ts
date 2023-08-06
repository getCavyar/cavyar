import { recursivelyReadDirectory, shouldIgnore } from "./utils/file_system";
// import { OpenAI } from "langchain/llms/openai";
import { encoding_for_model } from "@dqbd/tiktoken";
import { createCodeSummary } from "./prompts";
import fs from "fs";
import path from "path";
import { callLLM } from "./utils/model";

const directories = ["anchor"];

const ignore = [
  "**/.*",
  "**/*package-lock.json",
  "**/*package.json",
  "**/node_modules",
  "**/*dist*",
  "**/*build*",
  "**/*test*",
  "**/*.toml",
  "**/*.lock",
  "**/*.md",
  "**/*.txt",
  "**/*.svg",
  "**/*.jsx",
  "**/*.png",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.gif",
  "**/*.ico",
  "**/*.woff2",
  "**/*.css",
  "**/*.sh",
  "**/idl.json",
  "**/LICENSE",
];

const BASE_PATH = "/home/ubuntu/coding/cavyar/ai/context_data_sources";

const filePrompt =
  "Write a detailed technical explanation of what this code does. \n      Focus on the high-level purpose of the code and how it may be used in the larger project.\n      Include code examples where appropriate. Keep you response between 100 and 300 words. \n      DO NOT RETURN MORE THAN 300 WORDS.\n      Output should be in form of comments next to the code.\n      Do not just list the methods and classes in this file.";

const prepareData = async () => {
  const files = recursivelyReadDirectory(`${BASE_PATH}/anchor`, ignore);

  console.log("Total Files Amount:", files.length);

  let totalCost = 0;

  const callLLMParallel = async (file: string) => {
    const fileContent = fs.readFileSync(file).toString();
    const summaryPrompt = createCodeSummary(
      "anchor",
      file,
      fileContent,
      filePrompt
    );
    // console.log("prompt length", summaryPrompt.length);
    if (ttEncoding.encode(summaryPrompt).length > 8000) {
      console.log("ℹ️ Long Prompt", file);
      return;
    }

    const cost = getCostForPrompt(summaryPrompt);
    totalCost += cost;
    console.log("total cost: ", "$" + totalCost);

    try {
      const aiSummary = await callLLM(summaryPrompt);
      createDirectoryAndWriteFile(file, aiSummary + "\n\n" + fileContent);
      console.log("Done:" + file);
    } catch (error) {
      console.error(error);
    }
  };

  await Promise.all(files.map(callLLMParallel));
};

const createDirectoryAndWriteFile = (filePath: string, fileContent: string) => {
  const oldDirectory = path.dirname(filePath);

  const newDirectory = oldDirectory.replace("context_data_sources", "doc");

  console.log(newDirectory);

  // Check if the directory exists, create it if it doesn't
  if (!fs.existsSync(newDirectory)) {
    fs.mkdirSync(newDirectory, { recursive: true });
  }

  fs.writeFileSync(
    filePath.replace("context_data_sources", "doc"),
    fileContent
  );
};

const ttEncoding = encoding_for_model("gpt-3.5-turbo");

const getCostForPrompt = (prompt: string) => {
  const summaryLength = ttEncoding.encode(prompt).length;

  // $0.002 / 1K tokens
  const costPerToken = 0.002 / 1000;

  return summaryLength * costPerToken;
};

prepareData();
