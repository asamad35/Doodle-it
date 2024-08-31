import Image from "next/image";
import React from "react";

const UndoRedo = ({
  undoFunction,
  redoFunction,
  boardHistoryStack,
  undoHistoryStack,
}: {
  undoFunction: () => void;
  redoFunction: () => void;
  boardHistoryStack: ElementType[][];
  undoHistoryStack: ElementType[][];
}) => {
  return (
    <div className="absolute bottom-4 z-[1000] left-52 flex gap-3 bg-gray-200 rounded-md">
      <button
        onClick={undoFunction}
        className={`hover:bg-gray-100 p-2 rounded-l-md relative group duration-200 ${
          boardHistoryStack.length === 0 ? "opacity-55" : ""
        }`}
        disabled={boardHistoryStack.length === 0}
      >
        <Image src="/undo.svg" alt="plus" width={20} height={20} />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 my-1.5 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Undo
        </span>
      </button>
      <button
        onClick={redoFunction}
        className={`hover:bg-gray-100 rounded-r-md p-2 group relative duration-200 ${
          undoHistoryStack.length === 0 ? "opacity-55" : ""
        }`}
        disabled={undoHistoryStack.length === 0}
      >
        <Image src="/redo.svg" alt="plus" width={20} height={20} />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 my-1.5 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Redo
        </span>
      </button>
    </div>
  );
};

export default UndoRedo;
