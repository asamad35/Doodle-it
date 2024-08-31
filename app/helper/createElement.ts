import rough from "roughjs";
import { calculateDiameter } from "./getElementAtPosition";

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
