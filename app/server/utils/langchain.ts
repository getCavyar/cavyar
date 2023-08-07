import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIChat } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { PromptTemplate } from "langchain/prompts";

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

export const QA_PROMPT = PromptTemplate.fromTemplate(`
You are an AI assistant for CAVYAR, a snippets devtool platform on Solana. You are a world class developer and have expertise in Solana web3.js, Anchor and rust.
Anchor is a Rust framework for Solana smart contracts.
Web3.js is a JavaScript library for interacting with the Solana blockchain.
You are given a question on what a piece of solana code does.
You should answer the question by providing an answer, that goes straight to the point.
Focus on providing good and short useful answers, not long and generic explanations.
Once you wrote your main short answer, WRITE MORE explanations on every sub-aspect of the snippet

Assume the reader is a technical person but is not deeply familiar with Anchor or Rust.
Do not reference the context in your answer. Instead use the context to inform your answer.
If you don't know the answer, just say "Explanation not available." Don't try to make up an answer.
If the question is not about Anchor or Web3.js, politely inform them that you are tuned to only answer questions about the Anchor framework or web3.js or rust solana smart contracts.
Your answer should be at least 200 words and no more than 500 words.
Do NOT include information that is not directly relevant to the question, even if the context includes it.
Answer in markdown and use \`code\` for referencing parts of the code.
Also use lists, bold and italics to make your answer more readable.

Snippet: 
{question}

Context:
{context}

Answer:
`);

// The Context includes the User's own description of the snippet, the tags, the title and the framework.
// The User's inputs can be bad, so you should not rely on them too much. You should primarily rely on the code.
// If you think the User's inputs are not bad or wrong you can use them without mentioning that they are from the User.
// Context:
// {context}

// export const QA_PROMPT = PromptTemplate.fromTemplate(`
// Write a concise summary of the following code snippet:

// {text}

// CONCISE SUMMARY:
// `);

export const getModel = (onTokenStream?: (token: string) => void) => {
  return new OpenAIChat({
    temperature: 0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    modelName: "gpt-3.5-turbo",
    streaming: Boolean(onTokenStream),
    callbackManager: {
      handleLLMError: (error: any) => {
        console.log("error", error);
      },
      handleLLMNewToken: onTokenStream,
    } as any,
  });
};

export const makeChain = (
  vectorstore: HNSWLib,
  onTokenStream?: (token: string) => void,
) => {
  const model = getModel(onTokenStream);

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      memory: new BufferMemory({
        memoryKey: "chat_history",
      }),
      questionGeneratorChainOptions: {
        template: CONDENSE_PROMPT.template,
      },
      qaChainOptions: {
        prompt: QA_PROMPT,
        type: "stuff",
      },
    },
  );
  return chain;
};

/* const questionGenerator = new LLMChain({
    llm: new OpenAIChat({ temperature: 0.1, modelName: "gpt-3.5-turbo" }),
    prompt: CONDENSE_PROMPT,
  });
  const docChain = loadQAChain(
    new OpenAIChat({
      temperature: 0.2,
      frequencyPenalty: 0,
      presencePenalty: 0,
      modelName: "gpt-3.5-turbo",
      streaming: Boolean(onTokenStream),
      callbackManager: {
        handleLLMStart: () => {},
        handleLLMEnd: () => {},
        handleLLMError: (error: any) => {
          console.log("error", error);
        },
        handleLLMNewToken: onTokenStream,
      } as any,
    }),
    { prompt: QA_PROMPT }
  ); */
