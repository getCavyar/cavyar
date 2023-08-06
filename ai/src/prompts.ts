export const createCodeSummary = (
  projectName: string,
  filePath: string,
  fileContents: string,
  filePrompt: string
) => {
  return `You are acting as a code documentation expert for a project called ${projectName}.
    Below is the code from a file located at \`${filePath}\`. 
    ${filePrompt}
    Do not say "this file is a part of the ${projectName} project".

    code:
    ${fileContents}

    Response:
    
    `;
};
