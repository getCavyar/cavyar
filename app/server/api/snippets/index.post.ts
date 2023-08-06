import { ObjectId } from "mongodb";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { isAuthenticated } from "~/server/utils/auth";
import { snippetsRef, usersRef } from "~~/server/plugins/mongodb";
import { SuccessResponse } from "~~/server/utils/responses";
import { postSnippetValidator } from "~~/server/utils/validators";
import { POSTSnippet } from "~~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<POSTSnippet>(event);
    const isValid = postSnippetValidator(body);

    if (!isValid) {
      return ErrorResponse.new(400, DefaultResponses.InvalidRequestBody, null);
    }

    const session = await isAuthenticated(event);

    const createdAt = Date.now();

    const user = await usersRef.findOne({ publicKey: session.user!.name! });

    let aiExplanation: string | null = null;

    if (user?.username && body.framework !== "seahorse") {
      const vectorStore = await HNSWLib.fromDocuments(
        [
          new Document({
            pageContent: `Snippet Code: \n${body.code}`,
            metadata: {
              title: body.title,
              description: body.description,
              tags: body.tags,
            },
          }),
        ],
        new OpenAIEmbeddings(),
      );

      const chain = makeChain(vectorStore);

      const res = await chain.call({
        question: body.code,
      });

      aiExplanation = res.text;
    }

    const snippets = await snippetsRef.insertOne({
      _id: ObjectId.createFromTime(createdAt / 1000),
      title: body.title,
      description: body.description,
      creator: body.creator,
      tags: body.tags,
      code: body.code,
      framework: body.framework,
      createdAt,
      updatedAt: null,
      likes: [],
      dislikes: [],
      aiExplanation,
    });

    return SuccessResponse.new<string>(
      200,
      "Snippet created",
      snippets.insertedId.toString(),
    );
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
