type OptionsType = {
  color: string;
  brushSize: number;
};

type PointType = {
  x: number;
  y: number;
};

type ElementType = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  points: PointType[];
  type: ToolItemType;
  options: OptionsType;
  xOffsets?: number[];
  yOffsets?: number[];
};

const toolItems = {
  pointer: "pointer",
  freehand: "freehand",
};

type ToolItemType = keyof typeof toolItems;
