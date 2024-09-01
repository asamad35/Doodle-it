import { useSetOptions } from "@/app/recoil/options";
import ColorPicker from "./ColorPicker";
import DrawStyle from "./DrawStyle";
import {
  fillColors,
  fillStyles,
  strokeColors,
  strokeStyles,
  strokeWidth,
} from "./helper";

const SideToolbar = ({ selectedTool }: { selectedTool: ToolItemType }) => {
  const setOptions = useSetOptions();
  const updateStrokeColor = (color: string) => {
    setOptions((prev) => ({ ...prev, strokeColor: color }));
  };
  const updateFillColor = (color: string) => {
    setOptions((prev) => ({ ...prev, fillColor: color }));
  };
  const updateFillStyle = (style: FillStyleType) => {
    setOptions((prev) => ({ ...prev, fillStyle: style }));
  };
  const updateStrokeStyle = (style: StrokeStyleType) => {
    setOptions((prev) => ({ ...prev, strokeStyle: style }));
  };
  const updateStrokeWidth = (style: StrokeWidthType) => {
    setOptions((prev) => ({ ...prev, strokeWidth: style }));
  };
  return (
    <>
      {!["pan", "pointer", "eraser"].includes(selectedTool) ? (
        <section className="absolute top-1/2 -translate-y-1/2 left-32 flex flex-col justify-center items-center -translate-x-1/2 bg-white rounded-lg shadow-md p-4 border-gray-200 border-[1px] space-x-2">
          <ColorPicker
            heading="Stroke"
            colorsArray={strokeColors}
            onClick={updateStrokeColor}
            type="strokeColor"
          />
          <ColorPicker
            heading="Fill"
            colorsArray={fillColors}
            onClick={updateFillColor}
            type="fillColor"
          />
          {selectedTool !== "freehand" && (
            <DrawStyle
              heading="Stroke Style"
              styleArray={strokeStyles}
              onClick={updateStrokeStyle}
              type="strokeStyle"
            />
          )}
          {!["freehand", "line"].includes(selectedTool) && (
            <>
              <DrawStyle
                heading="Fill Style"
                styleArray={fillStyles}
                onClick={updateFillStyle}
                type="fillStyle"
              />
            </>
          )}
          <DrawStyle
            heading="Stroke Width"
            styleArray={strokeWidth}
            onClick={updateStrokeWidth}
            type="strokeWidth"
          />
        </section>
      ) : null}
    </>
  );
};

export default SideToolbar;
