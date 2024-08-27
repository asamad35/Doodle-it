import { useOptions } from "@/app/recoil/options";
import React from "react";

const ColorPicker = ({
  heading,
  colorsArray,
  onClick,
  type,
}: {
  heading: string;
  colorsArray: string[];
  onClick: (color: string) => void;
  type: "strokeColor" | "fillColor";
}) => {
  const options = useOptions();
  return (
    <div className="mb-4">
      <p className="text-xs mb-1">{heading}</p>
      <div className="flex -translate-x-1">
        {colorsArray.map((color) => (
          <button
            key={color}
            onClick={() => onClick(color)}
            className={`flex justify-center items-center duration-300 hover:border-violet-${
              options[type] === color ? "600" : "300"
            } border-[2px] border-${
              options[type] === color ? "violet-600" : "white"
            }  rounded-md`}
          >
            <div
              style={
                color === "#ffffff"
                  ? {
                      backgroundImage: `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==)`,
                    }
                  : {}
              }
              className={`bg-[${color}] h-5 w-5 rounded-[5px] m-0.5`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
