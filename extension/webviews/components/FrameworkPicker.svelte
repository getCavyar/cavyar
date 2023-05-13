<!--<script lang="ts">
    import { search } from "../stores";
  
    const selectedFrameworkIcon = (selectedFramework: string) => {
      switch (selectedFramework) {
        case "anchor":
          return "https://www.anchor-lang.com/_next/image?url=%2Flogo.png&w=64&q=75";
        case "typescript":
          return "https://cdn-icons-png.flaticon.com/512/5968/5968381.png";
        case "seahorse":
          return "https://pbs.twimg.com/profile_images/1556384244598964226/S3cx06I2_400x400.jpg";
      }
    };
  </script>
  
  <div class="framework-picker">
    <img
      on:click={() => selectedFramework.set("anchor")}
      src={selectedFrameworkIcon($selectedFramework)}
      alt="anchor"
      class={$selectedFramework == "anchor"
        ? "selected-framework-icon"
        : "framework-icon"}
    />
    <img
      on:click={() => selectedFramework.set("typescript")}
      src={selectedFrameworkIcon($selectedFramework)}
      alt="Typescript"
      class={$selectedFramework == "typescript"
        ? "selected-framework-icon"
        : "framework-icon"}
    />
    <img
      on:click={() => selectedFramework.set("seahorse")}
      src={selectedFrameworkIcon($selectedFramework)}
      alt="seahorse"
      class={$selectedFramework == "seahorse"
        ? "selected-framework-icon"
        : "framework-icon"}
    />
  </div>
  
  <style scoped>
    .framework-picker {
      width: 100px;
      padding: 5px;
      border-radius: 9999px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      outline: 1px solid var(--vscode-input-border);
    }
    .framework-icon {
      cursor: pointer;
      filter: brightness(0.8);
      width: 22px;
      height: 22px;
      border-radius: 9999px;
    }
    .selected-framework-icon {
      filter: brightness(1);
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      outline: 3px solid var(--vscode-button-background);
    }
  </style>
-->
