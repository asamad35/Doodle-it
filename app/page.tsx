"use client";
import {
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { getStroke } from "perfect-freehand";
import { RoughCanvas } from "roughjs/bin/canvas";
import { useElements, useSetElement } from "./recoil/elements";
import { useOptions, useSetOptions } from "./recoil/options";
import {
  createElement,
  drawElements,
  getElementAtPosition,
  getResizedCoordinates,
  moveElement,
  updateElement,
} from "./helper";
import { v4 as uuidv4 } from "uuid";
import Toolbar from "./components/Toolbar";

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
      const selectedElement = { ...element };
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
          if (
            ["topLeft", "topRight", "bottomLeft", "bottomRight"].includes(
              selectedElement.position ?? ""
            )
          ) {
            setIsResizing(true);
          }
          break;
        default:
          break;
      }
      setSelectedElement(selectedElement);
    } else {
      const newElement = createElement(
        uuidv4(),
        e.clientX,
        e.clientY,
        e.clientX,
        e.clientY,
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
        switch (element?.position) {
          case "inside":
            document.body.style.cursor = "move";
            break;
          case "topLeft":
            document.body.style.cursor = "nw-resize";
            break;
          case "topRight":
            document.body.style.cursor = "ne-resize";
            break;
          case "bottomLeft":
            document.body.style.cursor = "sw-resize";
            break;
          case "bottomRight":
            document.body.style.cursor = "se-resize";
            break;

          default:
            document.body.style.cursor = "default";
            break;
        }
      } else {
        document.body.style.cursor = "default";
      }

      if (isSelectedElementGrabbed && selectedElement) {
        switch (selectedElement.type) {
          case "freehand":
            moveElement(
              e.clientX,
              e.clientY,
              e.clientX,
              e.clientY,
              selectedElement,
              setElements
            );
            break;

          case "rectangle":
            if (isResizing) {
              const resizedCoordinates = getResizedCoordinates(
                e.clientX,
                e.clientY,
                selectedElement
              );

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
            }
            break;
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
