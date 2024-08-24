type OptionsType = {
  color: string;
  brushSize: number;
};

type PointType = {
  x: number;
  y: number;
};

// type ElementType = {
//   id: string;
//   x1: number;
//   y1: number;
//   x2: number;
//   y2: number;
//   points?: PointType[];
//   type: ToolItemType;
//   options: OptionsType;
//   xOffsets?: number[];
//   yOffsets?: number[];
//   roughElement?: any;
// };

type BaseElementType = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ToolItemType;
  options: OptionsType;
  xOffsets?: number[];
  yOffsets?: number[];
  position: string | null;
};

type FreehandElementType = BaseElementType & {
  type: "freehand";
  points: PointType[];
};

type RectangleElementType = BaseElementType & {
  type: "rectangle";
  roughElement: any;
};

type ElementType = FreehandElementType | RectangleElementType;

const toolItems = {
  pointer: "pointer",
  freehand: "freehand",
  rectangle: "rectangle",
};

type ToolItemType = keyof typeof toolItems;
