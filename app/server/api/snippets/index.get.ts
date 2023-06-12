import { compareSnippet } from "~/server/utils/sorting";

import { snippetsRef } from "~~/server/plugins/mongodb";
import { Snippet } from "~~/ts/types";

export default defineEventHandler(async (event) => {
  try {
    const { query } = getQuery(event) as { query?: string };

    if (query !== undefined) {
      // Query provided

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

      return {
        snippets,
      };
    } else {
      // No query provided - return 15 snippets
      const snippets = await snippetsRef
        .find({})
        // .sort({ createdAt: -1 })
        .limit(15)
        .toArray();

      return SuccessResponse.new<Snippet[]>(
        200,
        "Operation was successful",
        snippets
      );
    }
  } catch (error) {
    console.log(error);
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
