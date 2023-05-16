import { ObjectId } from "mongodb";
import { client } from "~~/server/plugins/mongodb";
import { snippetsRef } from "~~/server/plugins/mongodb";
import { Snippet } from "~~/ts/types";

export default defineEventHandler(async (event) => {
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
      .toArray();

    return {
      snippets,
    };
  } else {
    // No query provided
    const snippets = await snippetsRef.find({}).toArray();
    return {
      snippets,
    };
  }
});
