import { Snippet } from "~/ts/types";

const compareString = (a: string, b: string): number => {
  return a.localeCompare(b);
};

const compareProperty = <T>(a: T, b: T, property: keyof T): number => {
  const aValue = String(a[property]).toLowerCase();
  const bValue = String(b[property]).toLowerCase();
  return compareString(aValue, bValue);
};

export const compareSnippet = (
  a: Snippet,
  b: Snippet,
  queryLower: string
): number => {
  const properties: (keyof Snippet)[] = [
    "title",
    "description",
    "tags",
    "code",
  ];

  for (const property of properties) {
    const aMatch = String(a[property]).toLowerCase().includes(queryLower);
    const bMatch = String(b[property]).toLowerCase().includes(queryLower);

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    if (aMatch && bMatch) {
      const result = compareProperty(a, b, property);
      if (result !== 0) return result;
    }
  }

  return 0;
};
