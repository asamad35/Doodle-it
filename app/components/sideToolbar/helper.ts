import { FaSquare } from "react-icons/fa";
// import CrossHatchSvg from "@/assets/cross-hatch.svg";

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
