type StrokeStyleType = "solid" | "dashed" | "dotted";
type FillStyleType = "hachure" | "solid";

type OptionsType = {
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyleType;
  roughness: number;
  fillStyle: FillStyleType;
  fillColor: string;
};

type PointType = {
  x: number;
  y: number;
};

type BaseElementType = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ToolItemType;
  options: OptionsType;

  position: string | null;
};

type FreehandElementType = BaseElementType & {
  type: "freehand";
  points: PointType[];
  xOffsets?: number[];
  yOffsets?: number[];
};

type RectangleElementType = BaseElementType & {
  type: "rectangle";
  roughElement: any;
  xOffset?: number;
  yOffset?: number;
};

type LineElementType = BaseElementType & {
  type: "line";
  roughElement: any;
  xOffset?: number;
  yOffset?: number;
};

type CircleElementType = BaseElementType & {
  type: "circle";
  roughElement: any;
  xOffset?: number;
  yOffset?: number;
};

type ElementType =
  | FreehandElementType
  | RectangleElementType
  | LineElementType
  | CircleElementType;

const toolItems = {
  pointer: "pointer",
  freehand: "freehand",
  rectangle: "rectangle",
  line: "line",
  circle: "circle",
  eraser: "eraser",
};

type ToolItemType = keyof typeof toolItems;
