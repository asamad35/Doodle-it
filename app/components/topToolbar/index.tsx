import React, { RefObject, useEffect } from "react";
import { FaRegCircle, FaRegSquare } from "react-icons/fa";
import { GoDash } from "react-icons/go";
import { IoHandRightOutline } from "react-icons/io5";
import { LuEraser, LuPencil } from "react-icons/lu";
import { TbPointer } from "react-icons/tb";

const toolItems = {
  pointer: "pointer",
  freehand: "freehand",
  rectangle: "rectangle",
  line: "line",
  circle: "circle",
  eraser: "eraser",
  pan: "pan",
};

interface TopToolbarProps {
  setSelectedTool: (tool: ToolItemType) => void;
  selectedTool: ToolItemType;
  eraserRef: RefObject<HTMLButtonElement>;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  setSelectedTool,
  selectedTool,
  eraserRef,
}) => {
  const handleLineToggle = () => {
    setSelectedTool("line");
  };
  const handleFreehandToggle = () => {
    setSelectedTool("freehand");
  };
  const handleSelectToggle = () => {
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
  const handlePanToggle = () => {
    document.body.style.cursor = "grab";
    setSelectedTool("pan");
  };

  const iconSize = "15";

  useEffect(() => {
    if (selectedTool === toolItems.pan) {
      document.body.style.cursor = "grab";
    }  else {
      document.body.style.cursor = "crosshair";
    }
  }, [selectedTool]);

  const toolsDetails = [
    {
      type: toolItems.pan,
      icon: <IoHandRightOutline size={iconSize} />,
      tooltip: "pan",
      handleFunction: handlePanToggle,
    },
    {
      type: toolItems.pointer,
      icon: <TbPointer size={iconSize} />,
      tooltip: "Select",
      handleFunction: handleSelectToggle,
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
    <div className="absolute z-[999] flex justify-center items-center left-1/2 top-4 -translate-x-1/2 bg-white rounded-lg shadow-md p-1.5 border-gray-200 border-[1px] space-x-2">
      {toolsDetails.map((tool) => (
        <button
          ref={tool.type === "eraser" ? eraserRef : null}
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
    </div>
  );
};

export default TopToolbar;
