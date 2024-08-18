import React, { useRef, useState } from "react";
import { FaPalette, FaPencilAlt, FaRedo, FaUndo } from "react-icons/fa";
import { useClickAway } from "react-use";
import { useOptions, useSetOptions } from "../recoil/options";
import { HexColorPicker } from "react-colorful";
import { FaHand } from "react-icons/fa6";

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  setSelectedTool: (tool: ToolItemType) => void;
  selectedTool: ToolItemType;
  // onLineToggle: () => void;
  // onFreehandToggle: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  setSelectedTool,
  selectedTool,
  // onLineToggle,
  // onFreehandToggle,
}) => {
  const options = useOptions();
  const setOptions = useSetOptions();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const paletteButtonRef = useRef<HTMLButtonElement>(null);

  useClickAway(colorPickerRef, (event: MouseEvent | TouchEvent) => {
    if (!paletteButtonRef.current?.contains(event.target as Node)) {
      setIsColorPickerOpen(false);
    }
  });

  // const handleLineToggle = () => {
  //   setDrawType("line");
  // };
  const handleFreehandToggle = () => {
    setSelectedTool("freehand");
  };
  const handleMoveToggle = () => {
    setSelectedTool("pointer");
  };
  return (
    <div className="absolute flex z-[100] left-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-md p-2">
      <div className="flex flex-col space-y-2">
        <button
          onClick={onUndo}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer relative group"
        >
          <FaUndo className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Undo
          </span>
        </button>
        <button
          ref={paletteButtonRef}
          onClick={() => setIsColorPickerOpen((prev) => !prev)}
          className={`p-2 hover:bg-gray-100 rounded cursor-pointer relative group`}
        >
          <FaPalette className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Color Picker
          </span>
        </button>
        {isColorPickerOpen && (
          <div className="absolute left-full ml-2" ref={colorPickerRef}>
            <HexColorPicker
              color={options.color}
              onChange={(e: any) => setOptions({ ...options, color: e })}
            />
          </div>
        )}

        {/* <button
          onClick={handleLineToggle}
          className={`p-2 hover:bg-gray-100 rounded cursor-pointer relative group ${
            drawType === "line" ? "bg-gray-200" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M3.293 3.293a1 1 0 011.414 0L21 19.586V21a1 1 0 01-1 1h-1.414L3.293 6.707a1 1 0 010-1.414z" />
          </svg>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Line Tool
          </span>
        </button> */}
        <button
          onClick={handleFreehandToggle}
          className={`p-2 hover:bg-gray-100 rounded cursor-pointer relative group ${
            selectedTool === "freehand" ? "bg-gray-200" : ""
          }`}
        >
          <FaPencilAlt className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Freehand Tool
          </span>
        </button>
        <button
          onClick={handleMoveToggle}
          className={`p-2 hover:bg-gray-100 rounded cursor-pointer relative group ${
            selectedTool === "pointer" ? "bg-gray-200" : ""
          }`}
        >
          <FaHand className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Move Tool
          </span>
        </button>
      </div>
      {/* <div className="flex flex-col space-y-2">
        <button
          onClick={onRedo}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer relative group"
        >
          <FaRedo className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Redo
          </span>
        </button>
      </div> */}
    </div>
  );
};

export default Toolbar;
