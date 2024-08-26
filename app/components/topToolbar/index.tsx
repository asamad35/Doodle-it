import React, { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  FaPalette,
  FaPencilAlt,
  FaRedo,
  FaRegCircle,
  FaRegSquare,
  FaUndo,
} from "react-icons/fa";
import { FaHand } from "react-icons/fa6";
import { GoDash } from "react-icons/go";
import { useClickAway } from "react-use";
import { useOptions, useSetOptions } from "../../recoil/options";
import { IoHandRightOutline } from "react-icons/io5";
import { LuEraser, LuPencil } from "react-icons/lu";

const toolItems = {
  pointer: "pointer",
  freehand: "freehand",
  rectangle: "rectangle",
  line: "line",
  circle: "circle",
  eraser: "eraser",
};

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  setSelectedTool: (tool: ToolItemType) => void;
  selectedTool: ToolItemType;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  setSelectedTool,
  selectedTool,
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

  const handleLineToggle = () => {
    setSelectedTool("line");
  };
  const handleFreehandToggle = () => {
    setSelectedTool("freehand");
  };
  const handleMoveToggle = () => {
    setSelectedTool("pointer");
  };
  const handleRectangleToggle = () => {
    setSelectedTool("rectangle");
  };
  const handleCircleToggle = () => {
    setSelectedTool("circle");
  };

  const handleEraserToggle = () => {
    setSelectedTool("eraser");
  };

  const iconSize = "15";

  const toolsDetails = [
    {
      type: toolItems.pointer,
      icon: <IoHandRightOutline size={iconSize} />,
      tooltip: "Move",
      handleFunction: handleMoveToggle,
    },
    {
      type: toolItems.freehand,
      icon: <LuPencil size={iconSize} />,
      tooltip: "Freehand",
      handleFunction: handleFreehandToggle,
    },
    {
      type: toolItems.rectangle,
      icon: <FaRegSquare size={iconSize} />,
      tooltip: "Rectangle",
      handleFunction: handleRectangleToggle,
    },
    {
      type: toolItems.line,
      icon: <GoDash size={iconSize} />,
      tooltip: "Line",
      handleFunction: handleLineToggle,
    },
    {
      type: toolItems.circle,
      icon: <FaRegCircle size={iconSize} />,
      tooltip: "Circle",
      handleFunction: handleCircleToggle,
    },
    {
      type: toolItems.eraser,
      icon: <LuEraser size={iconSize} />,
      tooltip: "Eraser",
      handleFunction: handleEraserToggle,
    },
  ];

  return (
    <div className="absolute flex justify-center items-center left-1/2 top-4 -translate-x-1/2 bg-white rounded-lg shadow-md p-1.5 border-gray-200 border-[1px] space-x-2">
      {toolsDetails.map((tool) => (
        <button
          key={tool.type}
          onClick={tool.handleFunction}
          className={`p-2 rounded cursor-pointer relative group ${
            selectedTool === tool.type ? "bg-violet-200" : "hover:bg-violet-100"
          }`}
        >
          {tool.icon}
          <span className="absolute top-full  left-1/2 -translate-x-1/2 my-1.5 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {tool.tooltip}
          </span>
        </button>
      ))}

      {/* <button
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
        </button> */}
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
        <button
          onClick={handleRectangleToggle}
          className={`p-2 hover:bg-gray-100 rounded cursor-pointer relative group ${
            selectedTool === "rectangle" ? "bg-gray-200" : ""
          }`}
        >
          <FaRegSquare className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Rectangle
          </span>
        </button>
        <button
          onClick={handleLineToggle}
          className={`p-2 hover:bg-gray-100 rounded cursor-pointer relative group ${
            selectedTool === "line" ? "bg-gray-200" : ""
          }`}
        >
          <GoDash className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Line
          </span>
        </button>
        <button
          onClick={handleCircleToggle}
          className={`p-2 hover:bg-gray-100 rounded cursor-pointer relative group ${
            selectedTool === "circle" ? "bg-gray-200" : ""
          }`}
        >
          <FaRegCircle className="w-6 h-6" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Circle
          </span>
        </button>
      </div> */}
    </div>
  );
};

export default Toolbar;
