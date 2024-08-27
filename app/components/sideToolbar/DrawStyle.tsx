import { useOptions } from "@/app/recoil/options";
import Image from "next/image";
import React from "react";
import { fillStyles } from "./helper";

type styleType = "fillStyle" | "strokeStyle" | "strokeWidth";

const DrawStyle = ({
  heading,
  styleArray,
  onClick,
  type,
}: {
  heading: string;
  styleArray: typeof fillStyles;
  onClick: (style: FillStyleType) => void;
  type: styleType;
}) => {
  const options = useOptions();
  return (
    <div className="mb-4">
      <p className="text-xs mb-1">{heading}</p>
      <div className="flex -translate-x-1">
        {styleArray.map((style) => (
          <button
            key={style.type}
            onClick={() => onClick(style.type)}
            className={`flex justify-center p-2 m-1 items-center duration-300 ${
              options[type] === style.type ? "bg-violet-200" : "bg-[#f2f2f7] "
            } rounded-lg`}
          >
            <Image
              src={style.svgPath}
              alt={"abcd"}
              width={20}
              height={20}
              style={{ backgroundColor: "transparent" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default DrawStyle;
