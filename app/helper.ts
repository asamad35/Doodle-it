import { RoughCanvas } from "roughjs/bin/canvas";
import { useElements } from "./recoil/elements";
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
  elements: ElementType
) => {
  const strokePoints = getStroke(elements.points, {
    size: elements.options.brushSize,
  });
  const formattedPoints: [number, number][] = strokePoints.map((point) => {
    if (point.length !== 2) {
      throw new Error(
        `Expected point to have exactly 2 elements, got ${point.length}`
      );
    }
    return [point[0], point[1]];
  });
  const stroke = getSvgPathFromStroke(formattedPoints);
  myCanvasCtx.fill(new Path2D(stroke));
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

const positionWithinElement = (x: number, y: number, element: ElementType) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    // case Tools.line: {
    //   const on = onLine(x1, y1, x2, y2, x, y);
    //   const start = nearPoint(x, y, x1, y1, "start");
    //   const end = nearPoint(x, y, x2, y2, "end");
    //   return start || end || on;
    // }
    // case Tools.rectangle: {
    //   const topLeft = nearPoint(x, y, x1, y1, "topLeft");
    //   const topRight = nearPoint(x, y, x2, y1, "topRight");
    //   const bottomLeft = nearPoint(x, y, x1, y2, "bottomLeft");
    //   const bottomRight = nearPoint(x, y, x2, y2, "bottomRight");
    //   const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    //   return topLeft || topRight || bottomLeft || bottomRight || inside;
    // }
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
  x: number,
  y: number,
  selectedTool: ToolItemType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>,
  options: OptionsType
) {
  const newElement = {
    id: uuidv4(),
    type: selectedTool,
    x1: x,
    y1: y,
    x2: x,
    y2: y,
    options: {
      brushSize: options.brushSize,
      color: options.color,
    },
    points: [{ x, y }],
  };
  setElements((prev) => [...prev, newElement]);

  return newElement;
}

export const moveElement = (
  x: number,
  y: number,
  selectedElement: ElementType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>
) => {
  setElements((prev) => {
    const prevElements: ElementType[] = JSON.parse(JSON.stringify(prev));

    if (!selectedElement) return prevElements;
    const updatedElement = {
      ...selectedElement,
      points: selectedElement.points.map((point, index) => {
        return {
          x: x - (selectedElement.xOffsets?.[index] ?? 0),
          y: y - (selectedElement.yOffsets?.[index] ?? 0),
        };
      }),
    };
    const newElements = prevElements.map((element) => {
      if (element.id === selectedElement.id) return updatedElement;
      return element;
    });
    return newElements;
  });
};

export const updateElement = (
  x: number,
  y: number,
  selectedTool: ToolItemType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>
) => {
  if (selectedTool === "freehand") {
    setElements((prev) => {
      const newElements = [...prev];
      const lastElement = newElements[newElements.length - 1];
      return [
        ...newElements.slice(0, -1),
        {
          ...lastElement,
          points: [...lastElement.points, { x, y }],
        },
      ];
    });
  }
};
