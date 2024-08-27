import { useSetOptions } from "@/app/recoil/options";
import { FaSquare } from "react-icons/fa";
import ColorPicker from "./ColorPicker";
import DrawStyle from "./DrawStyle";
import { fillColors, fillStyles, strokeColors } from "./helper";

const SideToolbar = () => {
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

  return (
    <section className=" absolute top-1/2 -translate-y-1/2 left-10">
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
      <DrawStyle
        heading="Fill Style"
        styleArray={fillStyles}
        onClick={updateFillStyle}
        type="fillStyle"
      />
    </section>
  );
};

export default SideToolbar;
