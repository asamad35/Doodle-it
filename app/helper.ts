import { RoughCanvas } from "roughjs/bin/canvas";
import rough from "roughjs";
import getStroke from "perfect-freehand";
import { v4 as uuidv4 } from "uuid";

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
      const strokePoints = getStroke(element.points, {
        size: element.options.brushSize,
      });
      const formattedPoints: [number, number][] = strokePoints.map((point) => {
        if (point.length !== 2) {
          throw new Error(
            `Expected point to have exactly 2 element, got ${point.length}`
          );
        }
        return [point[0], point[1]];
      });
      const stroke = getSvgPathFromStroke(formattedPoints);
      myCanvasCtx.fillStyle = element.options.color;
      myCanvasCtx.fill(new Path2D(stroke));
      break;

    case "rectangle":
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
    // case Tools.line: {
    //   const on = onLine(x1, y1, x2, y2, x, y);
    //   const start = nearPoint(x, y, x1, y1, "start");
    //   const end = nearPoint(x, y, x2, y2, "end");
    //   return start || end || on;
    // }
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
    // case Tools.text:
    //   return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

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
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  selectedTool: ToolItemType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>,
  options: OptionsType
) {
  switch (selectedTool) {
    case "freehand": {
      const newElement = {
        id: id,
        type: selectedTool,
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        options: {
          brushSize: options.brushSize,
          color: options.color,
        },
        points: [{ x: x1, y: y1 }],
        position: null,
      };
      return newElement;
    }

    case "rectangle": {
      const generator = rough.generator({
        options: { stroke: options.color, strokeWidth: options.brushSize },
      });
      const roughRectangle = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      const rectangleElement = {
        id: id,
        x1,
        y1,
        x2,
        y2,
        type: selectedTool,
        roughElement: roughRectangle,
        options: {
          brushSize: options.brushSize,
          color: options.color,
        },
        position: null,
      };
      return rectangleElement;
    }
    default:
      throw new Error(`Type not recognised: ${selectedTool}`);
  }
}

export const moveElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  selectedElement: ElementType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>
) => {
  switch (selectedElement.type) {
    case "freehand":
      setElements((prev) => {
        const prevElements: ElementType[] = JSON.parse(JSON.stringify(prev));

        if (!selectedElement) return prevElements;
        const updatedElement = {
          ...selectedElement,
          points: selectedElement.points.map((point, index) => {
            return {
              x: x1 - (selectedElement.xOffsets?.[index] ?? 0),
              y: y1 - (selectedElement.yOffsets?.[index] ?? 0),
            };
          }),
        };
        const newElements = prevElements.map((element) => {
          if (element.id === selectedElement.id) return updatedElement;
          return element;
        });
        return newElements;
      });
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

    if (element.type === "rectangle") {
      const { options } = targetElement;
      const newRectangle = createElement(
        targetElement.id,
        x1,
        y1,
        x2,
        y2,
        element.type,
        setElements,
        options
      );
      return [
        ...prevElements.filter(
          (prevElement) => prevElement.id !== targetElement.id
        ),
        newRectangle,
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
    case "rectangle": {
      const { x1, y1, x2, y2, position } = element;
      switch (position) {
        case "topLeft":
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
          return {
            x1: x1,
            y1: y1,
            x2: clientX,
            y2: clientY,
          };
      }
    }

    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};
