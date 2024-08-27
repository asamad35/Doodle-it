import { useOptions, useSetOptions } from "@/app/recoil/options";
import { fillColors, strokeColors } from "./helper";
import ColorPicker from "./ColorPicker";

const SideToolbar = () => {
  const setOptions = useSetOptions();
  const updateStrokeColor = (color: string) => {
    setOptions((prev) => ({ ...prev, strokeColor: color }));
  };
  const updateFillColor = (color: string) => {
    setOptions((prev) => ({ ...prev, fillColor: color }));
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
    </section>
  );
};

export default SideToolbar;
