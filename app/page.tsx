"use client";
import { MouseEvent, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import { v4 as uuidv4 } from "uuid";
import Toolbar from "./components/topToolbar";
import {
  calculateDiameter,
  createElement,
  drawElements,
  getElementAtPosition,
  getResizedCoordinates,
  getUnitVector,
  handleCursorStyle,
  moveElement,
  updateElement,
} from "./helper";
import { useElements, useSetElement } from "./recoil/elements";
import { useOptions } from "./recoil/options";
import { useCursorPosition } from "./hooks/useCursorPosition";

export default function Home() {
  const setElements = useSetElement();
  const elements = useElements();
  const options = useOptions();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedTool, setSelectedTool] = useState<ToolItemType>("freehand");
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );
  const [isSelectedElementGrabbed, setIsSelectedElementGrabbed] =
    useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const { cursorX, cursorY } = useCursorPosition();

  useLayoutEffect(() => {
    const myCanvas = canvasRef.current;
    if (!myCanvas) return;
    const myCanvasCtx = myCanvas.getContext("2d") as CanvasRenderingContext2D;
    myCanvasCtx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    const roughCanvas = rough.canvas(myCanvas);
    elements.forEach((element) => {
      drawElements(roughCanvas, myCanvasCtx, element);
    });
  }, [elements, canvasRef]);

  const handleMouseUp = () => {
    setSelectedElement(null);
    setIsSelectedElementGrabbed(false);
    setIsDrawing(false);
    setIsResizing(false);
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "pointer") {
      const element = getElementAtPosition(e.clientX, e.clientY, elements);
      if (!element) return;
      setIsSelectedElementGrabbed(true);
      let selectedElement = { ...element };
      switch (selectedElement.type) {
        case "freehand":
          selectedElement.xOffsets = selectedElement.points.map(
            (point) => e.clientX - point.x
          );
          selectedElement.yOffsets = selectedElement.points.map(
            (point) => e.clientY - point.y
          );
          break;

        case "rectangle":
          {
            selectedElement.xOffset = e.clientX - selectedElement.x1;
            selectedElement.yOffset = e.clientY - selectedElement.y1;

            const grabbedFromEdge = [
              "topLeft",
              "topRight",
              "bottomLeft",
              "bottomRight",
            ].includes(selectedElement.position ?? "");
            if (grabbedFromEdge) {
              setIsResizing(true);
            }
          }
          break;

        case "line": {
          selectedElement.xOffset = e.clientX - selectedElement.x1;
          selectedElement.yOffset = e.clientY - selectedElement.y1;

          const grabbedFromEdge = ["start", "end"].includes(
            selectedElement.position ?? ""
          );
          if (grabbedFromEdge) {
            setIsResizing(true);
          }
          break;
        }

        case "circle": {
          selectedElement.xOffset = e.clientX - selectedElement.x1;
          selectedElement.yOffset = e.clientY - selectedElement.y1;

          const grabbed = ["circumference"].includes(
            selectedElement.position ?? ""
          );

          if (grabbed) {
            // find the diametrical opposite point exactly on circle
            const { x1, y1, x2, y2 } = selectedElement;
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;

            // Calculate the radius of the circle
            const radius = calculateDiameter(x1, y1, x2, y2) / 2;
            const { unitVectorX, unitVectorY } = getUnitVector(
              e.clientX,
              e.clientY,
              centerX,
              centerY,
              radius
            );

            // Scale the unit vector by the radius to get the exact point on the circumference
            const exactX = centerX + unitVectorX * radius;
            const exactY = centerY + unitVectorY * radius;

            // Calculate the opposite point exactly on the circumference
            const oppositeX = centerX - unitVectorX * radius;
            const oppositeY = centerY - unitVectorY * radius;

            const newCoordinates = {
              x1: oppositeX,
              y1: oppositeY,
              x2: exactX,
              y2: exactY,
            };

            selectedElement = { ...selectedElement, ...newCoordinates };

            updateElement(newCoordinates, setElements, selectedElement);

            setIsResizing(true);
          }
          break;
        }
        default:
          break;
      }
      setSelectedElement(selectedElement);
    } else {
      const newElement = createElement(
        uuidv4(),
        { x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY },
        selectedTool,
        setElements,
        options
      );
      setElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement);
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "pointer") {
      const element = getElementAtPosition(e.clientX, e.clientY, elements);
      if (element || isSelectedElementGrabbed) {
        handleCursorStyle(element?.position);
      } else {
        document.body.style.cursor = "default";
      }

      if (isSelectedElementGrabbed && selectedElement) {
        switch (selectedElement.type) {
          case "freehand":
            moveElement(e.clientX, e.clientY, selectedElement, setElements);
            break;

          case "rectangle":
          case "line":
            if (isResizing) {
              const resizedCoordinates = getResizedCoordinates(
                e.clientX,
                e.clientY,
                selectedElement
              );
              if (!resizedCoordinates) return;
              updateElement(
                {
                  x1: resizedCoordinates.x1,
                  y1: resizedCoordinates.y1,
                  x2: resizedCoordinates.x2,
                  y2: resizedCoordinates.y2,
                },
                setElements,
                selectedElement
              );
            } else {
              // move rectangle or line
              moveElement(e.clientX, e.clientY, selectedElement, setElements);
            }
            break;

          case "circle": {
            if (isResizing) {
              const updatedCoordinates = {
                x1: selectedElement.x1,
                y1: selectedElement.y1,
                x2: e.clientX,
                y2: e.clientY,
              };
              updateElement(updatedCoordinates, setElements, selectedElement);
            } else {
              moveElement(e.clientX, e.clientY, selectedElement, setElements);
            }
          }
        }
        return;
      }
    }
    if (isDrawing && selectedElement) {
      const { x1, y1 } = selectedElement;
      updateElement(
        {
          x1,
          y1,
          x2: e.clientX,
          y2: e.clientY,
        },
        setElements,
        selectedElement
      );
    }
  };

  return (
    <div>
      <p
        className="absolute text-sm bg-black bg-opacity-70 text-white p-1 rounded pointer-events-none"
        style={{ top: cursorY + 10, left: cursorX + 10 }}
      >
        {cursorX}|{cursorY}
      </p>
      <Toolbar
        onUndo={() => {}}
        onRedo={() => {}}
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
      />
      <canvas
        id="myCanvas"
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
}
