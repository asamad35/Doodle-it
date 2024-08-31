import getStroke from "perfect-freehand";
import { RoughCanvas } from "roughjs/bin/canvas";
import { getSvgPathFromStroke } from "./others";

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
          strokeWidth = 3;
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
