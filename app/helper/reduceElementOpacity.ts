import { createElement } from "./createElement";

function blendHexWithOpacity(hex: string, opacity: number) {
  // Remove the "#" if it exists
  hex = hex.replace("#", "");

  // If the hex code is shorthand (3 characters), expand it to 6 characters
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Validate that the hex code is now exactly 6 characters long
  if (hex.length !== 6) {
    throw new Error(
      "Invalid hex code provided. It should be 6 characters long."
    );
  }

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Blend the color with white based on the opacity
  const blendedR = Math.round(r + (255 - r) * (1 - opacity));
  const blendedG = Math.round(g + (255 - g) * (1 - opacity));
  const blendedB = Math.round(b + (255 - b) * (1 - opacity));

  // Convert the blended RGB back to a hex code
  const blendedHex = ((1 << 24) + (blendedR << 16) + (blendedG << 8) + blendedB)
    .toString(16)
    .slice(1)
    .toUpperCase();

  return `#${blendedHex}`;
}

export function reduceElementOpacity(
  element: ElementType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>
) {
  setElements((prev) => {
    const prevElements = [...prev];
    const targetElement = prevElements.find(
      (prevElement) => prevElement.id === element.id
    );
    if (!targetElement) return prevElements;

    if (element.type === "freehand") {
      return [
        ...prevElements.filter(
          (prevElement) => prevElement.id !== targetElement.id
        ),
        {
          ...targetElement,
          isErased: true,
          options: {
            ...targetElement.options,
            strokeColor: blendHexWithOpacity(
              targetElement.options.strokeColor,
              0.4
            ),
          },
        },
      ];
    }

    if (["rectangle", "circle", "line"].includes(element.type)) {
      const { options, x1, y1, x2, y2 } = targetElement;

      const newOptions = {
        ...options,
        strokeColor: blendHexWithOpacity(options.strokeColor, 0.4),
        fillColor: blendHexWithOpacity(options.fillColor, 0.4),
      };

      const newElement = createElement(
        targetElement.id,
        { x1, y1, x2, y2 },
        element.type,
        newOptions,
        true
      ) as RectangleElementType | LineElementType | CircleElementType;

      return [
        ...prevElements.filter(
          (prevElement) => prevElement.id !== targetElement.id
        ),
        newElement,
      ];
    }
    return prevElements;
  });
}
