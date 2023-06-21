import { compareSnippet } from "~/server/utils/sorting";
import { snippetsRef } from "~~/server/plugins/mongodb";
import { Snippet, DiscoveryResponse } from "~~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const { query, discovery } = getQuery(event) as {
      query?: string;
      discovery?: string;
    };

    if (query !== undefined) {
      // look in the fields title, description, and tags (List) for the query using regex (fuzzy search)
      const regex = new RegExp(query, "i");
      const snippets = await snippetsRef
        .find({
          $or: [
            { title: { $regex: regex } },
            { description: { $regex: regex } },
            { tags: { $regex: regex } },
            { code: { $regex: regex } },
          ],
        })
        .limit(15)
        .toArray();

      const queryLower = query.toLowerCase();

      snippets.sort((a: Snippet, b: Snippet) =>
        compareSnippet(a, b, queryLower)
      );

      return SuccessResponse.new<Snippet[]>(
        200,
        "Operation was successful",
        snippets
      );
    }
    if (discovery !== undefined && discovery === "true") {
      const topSnippets = await snippetsRef
        .aggregate<Snippet>([
          { $unwind: "$likes" },
          { $group: { _id: "$_id", likes: { $sum: 1 } } },
          { $sort: { likes: -1 } },
          { $limit: 6 },
          {
            $lookup: {
              from: "snippets", // Replace "snippets" with the actual collection name if different
              localField: "_id",
              foreignField: "_id",
              as: "snippet",
            },
          },
          { $unwind: "$snippet" },
          { $replaceRoot: { newRoot: "$snippet" } },
        ])
        .toArray();

      const recentSnippets = await snippetsRef
        .find<Snippet>({})
        .sort({ createdAt: -1 }) // newest first
        .limit(6)
        .toArray();

      return SuccessResponse.new<DiscoveryResponse>(
        200,
        "Operation was successful",
        {
          topSnippets,
          recentSnippets,
        }
      );
    } else {
      return ErrorResponse.new(400, "No query provided", null);
    }
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
