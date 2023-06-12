import { POSTSnippet } from "~~/ts/types";

export const postSnippetValidator = (body: POSTSnippet) => {
  // TODO add more detailed checks
  if (body.code.length < 1) return false;
  if (body.description.length < 10) return false;
  if (body.title.length < 5) return false;
  if (body.tags.length < 1) return false;
  if (body.creator === undefined) return false;
  if (
    body.framework !== "anchor" &&
    body.framework !== "seahorse" &&
    body.framework !== "typescript" &&
    body.framework !== "native"
  ) {
    return false;
  }

  return true;
};
