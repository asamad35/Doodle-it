import { RoughCanvas } from "roughjs/bin/canvas";
import rough from "roughjs";
import getStroke from "perfect-freehand";

export function getSvgPathFromStroke(stroke: [number, number][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}

export const drawElements = (
  roughCanvas: RoughCanvas,
  myCanvasCtx: CanvasRenderingContext2D,
  element: ElementType
) => {
  switch (element.type) {
    case "freehand":
      {
        let strokeWidth;
        if (element.options.strokeWidth === "thin") {
          strokeWidth = 2;
        }
        if (element.options.strokeWidth === "bold") {
          strokeWidth = 4;
        }
        if (element.options.strokeWidth === "extraBold") {
          strokeWidth = 8;
        }
        const strokePoints = getStroke(element.points, {
          size: strokeWidth,
        });
        const formattedPoints: [number, number][] = strokePoints.map(
          (point) => {
            if (point.length !== 2) {
              throw new Error(
                `Expected point to have exactly 2 element, got ${point.length}`
              );
            }
            return [point[0], point[1]];
          }
        );
        const stroke = getSvgPathFromStroke(formattedPoints);
        myCanvasCtx.fillStyle = element.options.strokeColor;
        myCanvasCtx.fill(new Path2D(stroke));
      }
      break;

    case "rectangle":
    case "line":
    case "circle":
      roughCanvas.draw(element.roughElement);
      break;
  }
};

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: ElementType[]
) => {
  return elements
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};
export const nearPoint = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  name: string
) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const positionWithinElement = (x: number, y: number, element: ElementType) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case "line": {
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, "start");
      const end = nearPoint(x, y, x2, y2, "end");
      return start || end || on;
    }
    case "rectangle": {
      const topLeft = nearPoint(x, y, x1, y1, "topLeft");
      const topRight = nearPoint(x, y, x2, y1, "topRight");
      const bottomLeft = nearPoint(x, y, x1, y2, "bottomLeft");
      const bottomRight = nearPoint(x, y, x2, y2, "bottomRight");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    }
    case "freehand": {
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return (
          onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null
        );
      });
      return betweenAnyPoint ? "inside" : null;
    }
    case "circle": {
      // center of the circle
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;

      // radius of the circle
      const radius = calculateDiameter(x1, y1, x2, y2) / 2;
      const inside = isCursorInsideCircle(x, y, centerX, centerY, radius);
      const onCircumference = isCursorOnCircumference(
        x,
        y,
        centerX,
        centerY,
        radius
      );
      return inside || onCircumference;
    }
    // case Tools.text:
    //   return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

function isCursorOnCircumference(
  cursorX: number,
  cursorY: number,
  cx: number,
  cy: number,
  radius: number,
  tolerance: number = 5
): string | null {
  const distance = Math.sqrt((cursorX - cx) ** 2 + (cursorY - cy) ** 2);
  return Math.abs(distance - radius) <= tolerance ? "circumference" : null;
}
function isCursorInsideCircle(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radius: number,
  margin: number = 5
): string | null {
  return Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <
    Math.pow(radius - 5, 2)
    ? "inside"
    : null;
}

const onLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
  maxDistance: number = 1
): string | null => {
  const a: PointType = { x: x1, y: y1 };
  const b: PointType = { x: x2, y: y2 };
  const c: PointType = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

const distance = (a: PointType, b: PointType) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

export function createElement(
  id: string,
  { x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number },
  selectedTool: ToolItemType,
  options: OptionsType,
  isErased: boolean = false
): ElementType {
  const roughOptions: any = {
    stroke: options.strokeColor,
    strokeWidth: options.strokeWidth,
    roughness: options.roughness,
    fill: options.fillColor,
    fillStyle: options.fillStyle,
  };

  if (options.strokeStyle === "dashed") {
    roughOptions.strokeLineDash = [8, 8];
  }
  if (options.strokeStyle === "dotted") {
    roughOptions.strokeLineDash = [3, 2];
  }
  if (options.strokeWidth === "thin") {
    roughOptions.strokeWidth = 1;
  }
  if (options.strokeWidth === "bold") {
    roughOptions.strokeWidth = 4;
  }
  if (options.strokeWidth === "extraBold") {
    roughOptions.strokeWidth = 8;
  }
  switch (selectedTool) {
    case "freehand": {
      const newElement = {
        id: id,
        type: selectedTool,
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        options: options,
        points: [{ x: x1, y: y1 }],
        position: null,
      };
      return newElement;
    }

    case "rectangle":
    case "circle":
    case "line": {
      const generator = rough.generator({
        options: roughOptions,
      });
      let roughFigure;
      if (selectedTool === "rectangle") {
        roughFigure = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      } else if (selectedTool === "line") {
        roughFigure = generator.line(x1, y1, x2, y2);
      } else if (selectedTool === "circle") {
        const diameter = calculateDiameter(x1, y1, x2, y2);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        roughFigure = generator.circle(cx, cy, diameter);
      }
      const roughElement = {
        id: id,
        x1,
        y1,
        x2,
        y2,
        type: selectedTool,
        roughElement: roughFigure,
        options: options,
        position: null,
        isErased: isErased,
      };
      return roughElement;
    }

    default:
      throw new Error(`Type not recognised: ${selectedTool}`);
  }
}

export const calculateDiameter = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const moveElement = (
  clientX: number,
  clientY: number,
  selectedElement: ElementType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>
) => {
  switch (selectedElement.type) {
    case "freehand": {
      setElements((prev) => {
        if (!selectedElement) return prev;
        const updatedElement = {
          ...selectedElement,
          points: selectedElement.points.map((point, index) => {
            return {
              x: clientX - (selectedElement.xOffsets?.[index] ?? 0),
              y: clientY - (selectedElement.yOffsets?.[index] ?? 0),
            };
          }),
        };
        const newElements = prev.map((element) => {
          if (element.id === selectedElement.id) return updatedElement;
          return element;
        });
        return newElements;
      });
      break;
    }

    case "rectangle":
    case "line": {
      const { x1, y1, x2, y2, xOffset, yOffset } = selectedElement;

      const updatedX1 = clientX - (xOffset ?? 0);
      const updatedY1 = clientY - (yOffset ?? 0);

      // updatedX2 is new x1 + width of the rectangle
      const updatedX2 = updatedX1 + (x2 - x1);
      // updatedY2 is new y1 + height of the rectangle
      const updatedY2 = updatedY1 + (y2 - y1);
      updateElement(
        {
          x1: updatedX1,
          y1: updatedY1,
          x2: updatedX2,
          y2: updatedY2,
        },
        setElements,
        selectedElement
      );
      break;
    }

    case "circle": {
      const { x1, y1, x2, y2, xOffset, yOffset } = selectedElement;
      const updatedX1 = clientX - (xOffset ?? 0);
      const updatedY1 = clientY - (yOffset ?? 0);
      const updatedX2 = x2 - x1 + updatedX1;
      const updatedY2 = y2 - y1 + updatedY1;

      updateElement(
        {
          x1: updatedX1,
          y1: updatedY1,
          x2: updatedX2,
          y2: updatedY2,
        },
        setElements,
        selectedElement
      );
      break;
    }
  }
};

export const updateElement = (
  { x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number },
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>,
  element: ElementType
) => {
  setElements((prev) => {
    const prevElements = [...prev];
    const targetElement = prevElements.find(
      (prevElement) => prevElement.id === element.id
    );
    if (!targetElement) return prevElements;

    if (element.type === "freehand") {
      if (targetElement.type !== "freehand") return prevElements;
      return [
        ...prevElements.filter(
          (prevElement) => prevElement.id !== targetElement.id
        ),
        {
          ...targetElement,
          points: [...targetElement.points, { x: x2, y: y2 }],
        },
      ];
    }

    if (["rectangle", "circle", "line"].includes(element.type)) {
      const { options } = targetElement;
      const newElement = createElement(
        targetElement.id,
        { x1, y1, x2, y2 },
        element.type,
        options
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
};

export const getResizedCoordinates = (
  clientX: number,
  clientY: number,
  element: ElementType
) => {
  switch (element.type) {
    case "line":
    case "rectangle": {
      const { x1, y1, x2, y2, position } = element;
      switch (position) {
        case "topLeft":
        case "start":
          return {
            x1: clientX,
            y1: clientY,
            x2: x2,
            y2: y2,
          };

        case "topRight":
          return {
            x1: x1,
            y1: clientY,
            x2: clientX,
            y2: y2,
          };

        case "bottomLeft":
          return {
            x1: clientX,
            y1: y1,
            x2: x2,
            y2: clientY,
          };

        case "bottomRight":
        case "end":
          return {
            x1: x1,
            y1: y1,
            x2: clientX,
            y2: clientY,
          };
      }
      break;
    }

    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

export function handleCursorStyle(position: string | null | undefined) {
  switch (position) {
    case "inside":
      document.body.style.cursor = "move";
      break;
    case "topLeft":
      document.body.style.cursor = "nw-resize";
      break;
    case "topRight":
      document.body.style.cursor = "ne-resize";
      break;
    case "bottomLeft":
      document.body.style.cursor = "sw-resize";
      break;
    case "bottomRight":
      document.body.style.cursor = "se-resize";
      break;

    case "circumference":
    case "start":
      document.body.style.cursor = "e-resize";
      break;
    case "end":
      document.body.style.cursor = "w-resize";
      break;

    default:
      document.body.style.cursor = "crosshair";
      break;
  }
}

export function getUnitVector(
  clientX: number,
  clientY: number,
  centerX: number,
  centerY: number,
  radius: number
) {
  // Calculate the vector from the center to the given point
  const vectorX = clientX - centerX;
  const vectorY = clientY - centerY;

  // Normalize the vector 11th class unit vector problem
  const length = Math.sqrt(Math.pow(vectorX, 2) + Math.pow(vectorY, 2));
  const unitVectorX = vectorX / length;
  const unitVectorY = vectorY / length;
  return { unitVectorX, unitVectorY };
}

export function getCalculatedMouseCoordinates(
  event: any,
  scale: number,
  panOffset: PointType,
  scaleOffset: PointType
) {
  // First, adjust the mouse position by subtracting the panOffset.
  let clientX = event.clientX - panOffset.x;
  let clientY = event.clientY - panOffset.y;

  // Then, apply the scale transformation to get the correct coordinates on the canvas.
  clientX = (clientX + scaleOffset.x) / scale;
  clientY = (clientY + scaleOffset.y) / scale;

  return { clientX, clientY };
}

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
