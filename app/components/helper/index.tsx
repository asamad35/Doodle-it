import React from "react";

const HelperModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000]">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={() => {
          setIsOpen(false);
          document.body.style.cursor = "crosshair";
        }}
      ></div>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto z-10 h-[80%] overflow-scroll overflow-x-hidden">
        <h2 className="text-2xl font-bold text-center text-violet-600">
          Welcome to Doodle-It! Guide
        </h2>
        <hr className="my-4 mx-4 ml-8" />
        <p className="mb-4">Get started with these simple steps:</p>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-1">
            <strong className="text-violet-400">Choose a Tool:</strong> Select
            from pencil, line, rectangle, or circle tools to start drawing.
          </li>
          <li className="mb-1">
            <strong className="text-violet-400">Draw, Adjust & Move:</strong>{" "}
            Click and drag on the canvas to draw. Select an element and drag to
            move or adjust it&apos;s dimensions.
          </li>
          <li className="mb-1">
            <strong className="text-violet-400">Erase:</strong> Select the
            eraser tool. Click and drag it over the elements to erase.
          </li>
          <li className="mb-1">
            <strong className="text-violet-400">Zoom:</strong> Use Ctrl + Scroll
            to zoom in and out of the canvas.
          </li>
          <li className="mb-1">
            <strong className="text-violet-400">Pan:</strong> Hold Space and
            drag to move around the canvas or select the pan tool.
          </li>
        </ul>
        <h3 className="text-xl text-center font-semibold  text-violet-600">
          Keyboard Shortcuts:
        </h3>
        <hr className="my-2 mx-24 " />
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong className="text-violet-400">Undo:</strong> Ctrl + Z
          </li>
          <li>
            <strong className="text-violet-400">Redo:</strong> Ctrl + Y or Ctrl
            + Shift + Z
          </li>
          <li>
            <strong className="text-violet-400">Zoom In:</strong> Ctrl + Plus
          </li>
          <li>
            <strong className="text-violet-400">Zoom Out:</strong> Ctrl + Minus
          </li>
        </ul>
        <p className="mb-4">Enjoy creating your masterpiece!</p>
        <button
          className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600"
          onClick={() => {
            setIsOpen(false);
            document.body.style.cursor = "crosshair";
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HelperModal;
