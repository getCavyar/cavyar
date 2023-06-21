import { snippetsRef } from "~/server/plugins/mongodb";
import { Snippet } from "~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const pubKey = event.context.params?.user;
    const {
      initial: initialStr,
      limit: limitStr,
      offset: offsetStr,
    } = getQuery(event) as {
      initial?: string;
      limit?: string;
      offset?: string;
    };
    const initial = initialStr === "true";
    const limit = parseInt(limitStr ?? "15");
    const offset = parseInt(offsetStr ?? "0");

    if (limit !== undefined && limit > 15) {
      return ErrorResponse.new(
        400,
        "Limit must be less than or equal to 15",
        null
      );
    }
    if (offset !== undefined && offset < 0) {
      return ErrorResponse.new(
        400,
        "Offset must be greater than or equal to 0",
        null
      );
    }

    const userSnippets = await snippetsRef
      .find({ creator: pubKey })
      .sort({ createdAt: -1 }) // newest first
      .limit(limit)
      .skip(offset)
      .toArray();

    if (initial === true) {
      return SuccessResponse.new<{
        userSnippets: Snippet[];
        totalSnippetsCount: number;
        totalLikesCount: number;
      }>(200, "Operation was successful", {
        userSnippets,
        totalSnippetsCount: await snippetsRef.countDocuments({
          creator: pubKey,
        }),
        // get all the likes for each snippet and sum them up
        totalLikesCount: await snippetsRef
          .aggregate([
            { $match: { creator: pubKey } },
            { $group: { _id: null, total: { $sum: { $size: "$likes" } } } },
          ])
          .toArray()
          .then((res) => res[0]?.total ?? 0),
      });
    } else {
      return SuccessResponse.new<Snippet[]>(
        200,
        "Operation was successful",
        userSnippets
      );
    }
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
