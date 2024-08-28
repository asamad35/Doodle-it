"use client";
import {
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { v4 as uuidv4 } from "uuid";
import SideToolbar from "./components/sideToolbar";
import TopToolbar from "./components/topToolbar";
import {
  calculateDiameter,
  createElement,
  drawElements,
  getCalculatedMouseCoordinates,
  getElementAtPosition,
  getResizedCoordinates,
  getUnitVector,
  handleCursorStyle,
  moveElement,
  updateElement,
} from "./helper";
import { useCursorPosition } from "./hooks/useCursorPosition";
import { useElements, useSetElement } from "./recoil/elements";
import { useOptions } from "./recoil/options";
import Zoom from "./components/zoom";

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
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const myCanvas = canvasRef.current;
    if (!myCanvas) return;
    const myCanvasCtx = myCanvas.getContext("2d") as CanvasRenderingContext2D;
    myCanvasCtx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    // find center of scaled canvas
    const scaledWidth = myCanvas.width * scale;
    const scaledHeight = myCanvas.height * scale;
    const scaleOffsetX = (scaledWidth - myCanvas.width) / 2;
    const scaleOffsetY = (scaledHeight - myCanvas.height) / 2;
    setScaleOffset({ x: scaleOffsetX, y: scaleOffsetY });

    // save canvas state before translating
    myCanvasCtx.save();

    // translate canvas to panOffset
    myCanvasCtx.translate(
      panOffset.x - scaleOffsetX,
      panOffset.y - scaleOffsetY
    );

    myCanvasCtx.scale(scale, scale);

    const roughCanvas = rough.canvas(myCanvas);
    elements.forEach((element) => {
      drawElements(roughCanvas, myCanvasCtx, element);
    });

    // restore canvas state after drawing so that new drawings are not affected
    myCanvasCtx.restore();
  }, [elements, canvasRef, panOffset, scale]);

  useEffect(() => {
    document.body.style.cursor = "crosshair";
  }, []);

  const handleMouseUp = () => {
    setSelectedElement(null);
    setIsSelectedElementGrabbed(false);
    setIsDrawing(false);
    setIsResizing(false);
    setIsPanning(false);
    document.body.style.cursor = "crosshair";
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = getCalculatedMouseCoordinates(
      e,
      scale,
      panOffset,
      scaleOffset
    );
    if (selectedTool === "pan") {
      setStartPanPosition({ x: clientX, y: clientY });
      setIsPanning(true);
      document.body.style.cursor = "grabbing";
      return;
    }

    if (selectedTool === "pointer") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (!element) return;
      setIsSelectedElementGrabbed(true);
      let selectedElement = { ...element };
      switch (selectedElement.type) {
        case "freehand":
          selectedElement.xOffsets = selectedElement.points.map(
            (point) => clientX - point.x
          );
          selectedElement.yOffsets = selectedElement.points.map(
            (point) => clientY - point.y
          );
          break;

        case "rectangle":
          {
            selectedElement.xOffset = clientX - selectedElement.x1;
            selectedElement.yOffset = clientY - selectedElement.y1;

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
          selectedElement.xOffset = clientX - selectedElement.x1;
          selectedElement.yOffset = clientY - selectedElement.y1;

          const grabbedFromEdge = ["start", "end"].includes(
            selectedElement.position ?? ""
          );
          if (grabbedFromEdge) {
            setIsResizing(true);
          }
          break;
        }

        case "circle": {
          selectedElement.xOffset = clientX - selectedElement.x1;
          selectedElement.yOffset = clientY - selectedElement.y1;

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
              clientX,
              clientY,
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
        { x1: clientX, y1: clientY, x2: clientX, y2: clientY },
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
    const { clientX, clientY } = getCalculatedMouseCoordinates(
      e,
      scale,
      panOffset,
      scaleOffset
    );
    if (selectedTool === "pan" && isPanning) {
      const dx = clientX - startPanPosition.x;
      const dy = clientY - startPanPosition.y;
      setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy });
      return;
    }

    if (selectedTool === "pointer") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element || isSelectedElementGrabbed) {
        handleCursorStyle(element?.position);
      } else {
        document.body.style.cursor = "crosshair";
      }

      if (isSelectedElementGrabbed && selectedElement) {
        switch (selectedElement.type) {
          case "freehand":
            moveElement(clientX, clientY, selectedElement, setElements);
            break;

          case "rectangle":
          case "line":
            if (isResizing) {
              const resizedCoordinates = getResizedCoordinates(
                clientX,
                clientY,
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
              moveElement(clientX, clientY, selectedElement, setElements);
            }
            break;

          case "circle": {
            if (isResizing) {
              const updatedCoordinates = {
                x1: selectedElement.x1,
                y1: selectedElement.y1,
                x2: clientX,
                y2: clientY,
              };
              updateElement(updatedCoordinates, setElements, selectedElement);
            } else {
              moveElement(clientX, clientY, selectedElement, setElements);
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
          x2: clientX,
          y2: clientY,
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
      <TopToolbar
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
      />
      <SideToolbar selectedTool={selectedTool} />
      <Zoom setScale={setScale} />
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
