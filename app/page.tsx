"use client";
import { MouseEvent, useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";
import { getStroke } from "perfect-freehand";
import { RoughCanvas } from "roughjs/bin/canvas";
import { useElements, useSetElement } from "./recoil/elements";
import { useOptions, useSetOptions } from "./recoil/options";
import {
  createElement,
  drawElements,
  getElementAtPosition,
  moveElement,
  updateElement,
} from "./helper";
import Toolbar from "./components/Toolbar";

export default function Home() {
  const setElements = useSetElement();
  const elements = useElements();
  const options = useOptions();

  const [selectedTool, setSelectedTool] = useState<ToolItemType>("freehand");
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );
  const [isSelectedElementGrabbed, setIsSelectedElementGrabbed] =
    useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // useEffect(() => {
  //   console.log({ elements, selectedElement });
  // }, [elements, selectedElement]);

  useLayoutEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const myCanvasCtx = myCanvas.getContext("2d") as CanvasRenderingContext2D;
    myCanvasCtx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    const roughCanvas = rough.canvas(myCanvas);
    // setRoughCanvas(roughCanvas);
    // setCanvasCtx(canvasCtx);

    elements.forEach((element) => {
      drawElements(roughCanvas, myCanvasCtx, element);
    });
  }, [elements]);

  // useEffect(() => {
  //   if (roughCanvas && canvasCtx) {
  //     let strokePoints = getStroke(drawingPoints, { smoothing: 1 }) as [
  //       number,
  //       number
  //     ][];
  //     const formattedPoints: [number, number][] = strokePoints.map((point) => {
  //       if (point.length !== 2) {
  //         throw new Error(
  //           `Expected point to have exactly 2 elements, got ${point.length}`
  //         );
  //       }
  //       return [point[0], point[1]];
  //     });
  //     const stroke = getSvgPathFromStroke(formattedPoints);
  //     canvasCtx.fill(new Path2D(stroke));
  //   }
  // }, [roughCanvas, drawingPoints, canvasCtx]);

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "pointer") {
      const element = getElementAtPosition(e.clientX, e.clientY, elements);
      if (element) {
        setIsSelectedElementGrabbed(true);
        const selectedElement = { ...element };
        selectedElement.xOffsets = selectedElement.points.map(
          (point) => e.clientX - point.x
        );
        selectedElement.yOffsets = selectedElement.points.map(
          (point) => e.clientY - point.y
        );
        setSelectedElement(selectedElement);
      }
    }
    if (selectedTool === "freehand") {
      createElement(e.clientX, e.clientY, selectedTool, setElements, options);
    }
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setSelectedElement(null);
    setIsSelectedElementGrabbed(false);
    setIsDrawing(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "pointer") {
      const element = getElementAtPosition(e.clientX, e.clientY, elements);
      if (element || isSelectedElementGrabbed) {
        document.body.style.cursor = "move";
      } else {
        document.body.style.cursor = "default";
      }
      if (isSelectedElementGrabbed && selectedElement) {
        moveElement(e.clientX, e.clientY, selectedElement, setElements);
      }
    }

    if (isDrawing) {
      updateElement(e.clientX, e.clientY, selectedTool, setElements);
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
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
}
