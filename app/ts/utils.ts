export const getAvatar = (seed: string): string => {
  return `https://api.dicebear.com/6.x/identicon/svg?rowColor=005d63&backgroundColor=052426&backgroundType=gradientLinear&seed=${seed}`;
};
