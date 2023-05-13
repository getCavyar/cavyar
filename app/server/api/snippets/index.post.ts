import { ObjectId } from "mongodb";
import { snippetsRef } from "~~/server/plugins/mongodb";
import { SuccessResponse } from "~~/server/utils/responses";
import { postSnippetValidator } from "~~/server/utils/validators";
import { POSTSnippet } from "~~/ts/types";

export default defineEventHandler(async (event) => {
  const body = await readBody<POSTSnippet>(event);
  const isValid = postSnippetValidator(body);

  if (!isValid) {
    return ErrorResponse.new(400, DefaultResponses.InvalidRequestBody, null);
  }

  //TODO AUTH here

  const createdAt = new Date().getTime();
  const snippets = await snippetsRef.insertOne({
    _id: ObjectId.createFromTime(createdAt / 1000),
    title: body.title,
    description: body.description,
    creator: body.creator,
    tags: body.tags,
    code: body.code,
    framework: body.framework,
    createdAt: createdAt,
    updatedAt: null,
    likes: [],
    aiExplanation: body.aiExplanation ?? null,
  });

  console.log("Snippet created", snippets.insertedId.toString());

  return SuccessResponse.new(
    200,
    "Snippet created",
    snippets.insertedId.toString()
  );
});
