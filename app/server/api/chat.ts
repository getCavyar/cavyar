import { LangChainStream, Message, streamToResponse } from "ai";
import {
  ConversationalRetrievalQAChain,
  LLMChain,
  loadQAChain,
} from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { PromptTemplate } from "langchain";
import { OpenAIChat } from "langchain/llms/openai";

// export const runtime = 'edge'

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate("");

const makeChain = (
  vectorstore: HNSWLib,
  onTokenStream?: (token: string) => void
) => {
  const questionGenerator = new LLMChain({
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
  );

  return new ConversationalRetrievalQAChain({
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
  });
};

export default defineEventHandler(async (event: any) => {
  // Extract the `prompt` from the body of the request
  const { messages } = await readBody(event);

  const { stream, handlers } = LangChainStream();

  const openaiApiKey = process.env.OPENAI_API_KEY || "";
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not set in the environment");
  } else {
    const vectorstore = await HNSWLib.fromDocuments([], new OpenAIEmbeddings());
    const chain = makeChain(vectorstore, (token: string) => {
      socket.send(
        JSON.stringify({
          data: token,
        })
      );
    });

    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    llm
      .call(
        (messages as Message[]).map((message) =>
          message.role === "user"
            ? new HumanChatMessage(message.content)
            : new AIChatMessage(message.content)
        )
      )
      // eslint-disable-next-line no-console
      .catch(console.error);

    return streamToResponse(stream, event.node.res);
  }
});
