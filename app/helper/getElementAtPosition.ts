
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



export const calculateDiameter = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};
