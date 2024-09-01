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

export function handleZoom(
  dZoom: number,
  setScale: React.Dispatch<React.SetStateAction<number>>,
  setZoomPercentage: React.Dispatch<React.SetStateAction<number>>,
  zoomPercentage: number
) {
  if (dZoom > 0 && zoomPercentage < 200) {
    setZoomPercentage((prevState) => Math.min(prevState + 10, 200));
    setScale((prevState) => prevState + dZoom);
  } else if (dZoom < 0 && zoomPercentage > 10) {
    setZoomPercentage((prevState) => Math.max(prevState - 10, 10));
    setScale((prevState) => prevState + dZoom);
  }
}
