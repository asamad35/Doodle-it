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
import SideToolbar from "./components/sideToolbar/index";
import TopToolbar from "./components/topToolbar/index";
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
  reduceElementOpacity,
  updateElement,
} from "./helper";
import { useCursorPosition } from "./hooks/useCursorPosition";
import { useElements, useSetElement } from "./recoil/elements";
import { useOptions } from "./recoil/options";
import Zoom from "./components/zoom/index";
import AnimatedCircles from "./components/MouseEraser";
import UndoRedo from "./components/undoRedo.tsx";
import useBoardHistory from "./hooks/useBoardHistory";

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
  const [action, setAction] = useState<ActionType>("none");
  const { cursorX, cursorY } = useCursorPosition();
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(2); // intial zoom value is 2 to ensure that the panOffset value doesn't become excessively large.
  const eraserRef = useRef<HTMLButtonElement>(null);
  const [isBoardModified, setIsBoardModified] = useState(false);
  const {
    pushToBoardHistory,
    boardHistoryStack,
    pushFromUndoToBoardHistory,
    pushToUndoHistory,
    undoHistoryStack,
  } = useBoardHistory();

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

    const centerX = myCanvas.width / 2;
    const centerY = myCanvas.height / 2;

    // Calculate the current and new scale offsets
    const scaleDiff = scale - 1;
    const newPanOffsetX = panOffset.x - scaleDiff * centerX;
    const newPanOffsetY = panOffset.y - scaleDiff * centerY;
    // setScaleOffset({ x: newPanOffsetX, y: newPanOffsetY });

    // Save canvas state before translating
    myCanvasCtx.save();

    // Translate canvas to the new panOffset
    myCanvasCtx.translate(newPanOffsetX, newPanOffsetY);

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
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    setIsBoardModified(true);
  }, [elements]);

  useEffect(() => {
    const latestBoard = boardHistoryStack[boardHistoryStack.length - 1] ?? [];
    setElements(latestBoard);
  }, [boardHistoryStack, setElements]);

  const handleMouseUp = () => {
    setSelectedElement(null);
    setIsSelectedElementGrabbed(false);

    if (selectedTool === "eraser") {
      setElements((prev) => {
        const prevElemensCount = prev.length;
        const newElements = prev.filter((element) => !element.isErased);
        const newElementsCount = newElements.length;
        if (prevElemensCount > newElementsCount) {
          pushToBoardHistory(newElements);
        }
        return newElements;
      });
    } else if (selectedTool === "pan") document.body.style.cursor = "grab";
    else document.body.style.cursor = "crosshair";

    if (isBoardModified && selectedTool !== "eraser") {
      pushToBoardHistory(elements);
    }

    setIsBoardModified(false);
    setAction("none");
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = getCalculatedMouseCoordinates(
      e,
      scale,
      panOffset,
      scaleOffset
    );

    if (selectedTool === "eraser") {
      setAction("erasing");
      return;
    }
    if (selectedTool === "pan") {
      setStartPanPosition({ x: clientX, y: clientY });
      setAction("panning");
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
              setAction("resizing");
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
            setAction("resizing");
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

            setAction("resizing");
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
        options
      );
      setElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement);
      setAction("drawing");
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = getCalculatedMouseCoordinates(
      e,
      scale,
      panOffset,
      scaleOffset
    );

    if (action === "erasing") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (!element || element.isErased) return;
      // reduce the element opacity to indicate that it will be erased
      reduceElementOpacity(element, setElements);
      return;
    }

    if (selectedTool === "pan" && action === "panning") {
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
            if (action === "resizing") {
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
            if (action === "resizing") {
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
    if (action === "drawing" && selectedElement) {
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
        eraserRef={eraserRef}
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
      />
      <SideToolbar selectedTool={selectedTool} />
      <Zoom setScale={setScale} />
      <UndoRedo
        undoFunction={pushToUndoHistory}
        redoFunction={pushFromUndoToBoardHistory}
        undoHistoryStack={undoHistoryStack}
        boardHistoryStack={boardHistoryStack}
      />
      <canvas
        id="myCanvas"
        ref={canvasRef}
        // width={window.innerWidth}
        // height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {selectedTool === "eraser" && <AnimatedCircles eraserRef={eraserRef} />}
    </div>
  );
}
