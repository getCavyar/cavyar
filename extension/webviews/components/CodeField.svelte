<script>
  import Prism from "prismjs";
  import "prismjs/components/prism-rust.js"; // Language
  import "prismjs/components/prism-typescript.js"; // Language
  import "prismjs/components/prism-python.js"; // Language

  import "prismjs/themes/prism-okaidia.css"; // Theme

  export let code;
  export let framework;

  const getLanguage = () => {
    switch (framework) {
      case "anchor":
        return "rust";
      case "typescript":
        return "typescript";
      case "seahorse":
        return "python";
      default:
        return "rust";
    }
  };
</script>

<code class="snippet-code">
  {@html Prism.highlight(code, Prism.languages[getLanguage()])}
</code>

<style scoped>
  .snippet-code {
    width: 100%;
    border-radius: 6px;
    font-size: 1rem;
    padding: 1rem;
    word-break: break-word;
    white-space: pre-wrap;
    font-family: "Menlo", monospace;
    border: 2px solid var(--vscode-input-border);
  }
</style>
