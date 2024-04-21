export const textColors = [
  "white",
  "red",
  "pink",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "black",
];

export const textColorCodes = {
  white: "#ffffff",
  red: "#ff0000",
  pink: "#ffc0cb",
  yellow: "#ffff00",
  green: "#008000",
  cyan: "#00ffff",
  blue: "#0000ff",
  purple: "#800080",
  black: "#000000",
};

export const textSizes = 50;

export const textOutlineStylePreview = (color: string) => {
  return (
    "1px 1px 0 " +
    color +
    ", -1px 1px 0 " +
    color +
    ", 1px -1px 0 " +
    color +
    ", -1px -1px 0 " +
    color +
    ", 1.5px 1.5px 0 " +
    color +
    ", 1.5px -1.5px 0 " +
    color +
    ", -1.5px 1.5px 0 " +
    color +
    ", -1.5px -1.5px 0 " +
    color
  );
};

export const textOutlineStyle = (color: string) => {
  return (
    "1px 1px 0 " +
    color +
    ", -1px 1px 0 " +
    color +
    ", 1px -1px 0 " +
    color +
    ", -1px -1px 0 " +
    color +
    ", 2px 2px 0 " +
    color +
    ", 2px -2px 0 " +
    color +
    ", -2px 2px 0 " +
    color +
    ", -2px -2px 0 " +
    color +
    ", 3px 3px 0 " +
    color +
    ", 3px -3px 0 " +
    color +
    ", -3px 3px 0 " +
    color +
    ", -3px -3px 0 " +
    color
  );
};
