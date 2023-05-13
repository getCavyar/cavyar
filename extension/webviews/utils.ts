import seedrandom from "seedrandom";

export const frameworks = {
  anchor: {
    name: "Anchor",
    icon: "https://www.anchor-lang.com/_next/image?url=%2Flogo.png&w=64&q=75",
  },
  typescript: {
    name: "Typescript",
    icon: "https://cdn-icons-png.flaticon.com/512/5968/5968381.png",
  },
  seahorse: {
    name: "Seahorse",
    icon: "https://pbs.twimg.com/profile_images/1556384244598964226/S3cx06I2_400x400.jpg",
  },
};

export const getFrameworkIcon = (selectedFramework: string) => {
  switch (selectedFramework) {
    case "anchor":
      return frameworks.anchor.icon;
    case "typescript":
      return frameworks.typescript.icon;
    case "seahorse":
      return frameworks.seahorse.icon;
  }
};

export const generateAvatar = (id: string): string => {
  // Define the size of the avatar (in pixels)
  const size = 40;

  // Generate a random seed based on the ID
  const seed = parseInt(id.slice(0, 8), 16);

  // Set up the canvas element
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Define the available colors
  const colors = [
    "#36FFD790",
    "#0074D990",
    "#2EBACC90",
    "#00FFBB90",
    "#7FDBFF90",
    "#0D39C990",
    "#1BFFC290",
    "#1A105A90",
  ];

  // Set the random seed
  const rng = seedrandom(seed.toString());

  // Loop through each pixel and set a random color
  for (let x = 0; x < size; x += 10) {
    for (let y = 0; y < size; y += 10) {
      const colorIndex = Math.floor(rng() * colors.length);
      const color = colors[colorIndex];
      ctx!.fillStyle = color;
      ctx!.fillRect(x, y, 10, 10);
    }
  }

  // Return the base64-encoded data URI of the canvas
  return canvas.toDataURL();
};
