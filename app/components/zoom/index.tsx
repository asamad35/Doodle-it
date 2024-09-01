import { handleZoom } from "@/app/helper/others";
import Image from "next/image";
import React from "react";

const Zoom = ({
  setScale,
  zoomPercentage,
  setZoomPercentage,
}: {
  setScale: React.Dispatch<React.SetStateAction<number>>;
  zoomPercentage: number;
  setZoomPercentage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <div className="absolute bottom-4 z-[1000] left-10 flex gap-3 bg-gray-200 rounded-md">
      <button
        onClick={() =>
          handleZoom(-0.1, setScale, setZoomPercentage, zoomPercentage)
        }
        className="hover:bg-gray-100 p-2 rounded-l-md relative group duration-200"
      >
        <Image src="/minus.svg" alt="plus" width={20} height={20} />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 my-1.5 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Zoom Out
        </span>
      </button>
      <button>{zoomPercentage}%</button>
      <button
        onClick={() =>
          handleZoom(0.1, setScale, setZoomPercentage, zoomPercentage)
        }
        className="hover:bg-gray-100 rounded-r-md p-2 group relative duration-200"
      >
        <Image src="/plus.svg" alt="plus" width={20} height={20} />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 my-1.5 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Zoom In
        </span>
      </button>
    </div>
  );
};

export default Zoom;
