export const strokeColors = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
];

export const fillColors = [
  "#ffffff",
  "#FFC9C9",
  "#B2F2BB",
  "#A5D8FF",
  "#FFEC99",
];

export const fillStyles: { type: FillStyleType; svgPath: string }[] = [
  { type: "hachure", svgPath: "/hachure.svg" },
  { type: "cross-hatch", svgPath: "/cross-hatch.svg" },
  { type: "solid", svgPath: "/solid.svg" },
];

export const strokeStyles: { type: StrokeStyleType; svgPath: string }[] = [
  { type: "solid", svgPath: "/stroke-solid.svg" },
  { type: "dashed", svgPath: "stroke-dashed.svg" },
  { type: "dotted", svgPath: "stroke-dotted.svg" },
];

export const strokeWidth: { type: StrokeWidthType; svgPath: string }[] = [
  { type: "thin", svgPath: "/stroke-thin.svg" },
  { type: "bold", svgPath: "stroke-bold.svg" },
  { type: "extraBold", svgPath: "stroke-extra-bold.svg" },
];
