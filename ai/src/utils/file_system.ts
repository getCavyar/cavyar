import fs from "fs";
import { minimatch } from "minimatch";
import path from "path";

export const shouldIgnore = (ignore: string[], fileName: string): boolean => {
  return ignore.some((pattern) => minimatch(fileName, pattern));
};

export const recursivelyReadDirectory = (
  directoryPath: string,
  ignore: string[] = []
): string[] => {
  // Read the contents of the directory
  const files = fs.readdirSync(directoryPath);

  // Array to store the file paths
  const filePaths: string[] = [];

  // Iterate over each file
  files.forEach((file) => {
    // Construct the full path of the current file
    const filePath = path.join(directoryPath, file);

    // Get the file's stats
    const stats = fs.statSync(filePath);

    if (!shouldIgnore(ignore, filePath)) {
      // Check if the current item is a directory
      if (stats.isDirectory()) {
        // Check if the directory should be ignored
        // It's a directory, recursively read the subdirectory and accumulate the file paths
        const subdirectoryFiles = recursivelyReadDirectory(filePath, ignore);
        filePaths.push(...subdirectoryFiles);
      } else {
        // It's a file, add its path to the array
        filePaths.push(filePath);
      }
    }
  });

  // Return the accumulated file paths
  return filePaths;
};
