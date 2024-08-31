import { updateElement } from "./updateElement";

export const moveElement = (
  clientX: number,
  clientY: number,
  selectedElement: ElementType,
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>
) => {
  switch (selectedElement.type) {
    case "freehand": {
      setElements((prev) => {
        if (!selectedElement) return prev;
        const updatedElement = {
          ...selectedElement,
          points: selectedElement.points.map((point, index) => {
            return {
              x: clientX - (selectedElement.xOffsets?.[index] ?? 0),
              y: clientY - (selectedElement.yOffsets?.[index] ?? 0),
            };
          }),
        };
        const newElements = prev.map((element) => {
          if (element.id === selectedElement.id) return updatedElement;
          return element;
        });
        return newElements;
      });
      break;
    }

    case "rectangle":
    case "line": {
      const { x1, y1, x2, y2, xOffset, yOffset } = selectedElement;

      const updatedX1 = clientX - (xOffset ?? 0);
      const updatedY1 = clientY - (yOffset ?? 0);

      // updatedX2 is new x1 + width of the rectangle
      const updatedX2 = updatedX1 + (x2 - x1);
      // updatedY2 is new y1 + height of the rectangle
      const updatedY2 = updatedY1 + (y2 - y1);
      updateElement(
        {
          x1: updatedX1,
          y1: updatedY1,
          x2: updatedX2,
          y2: updatedY2,
        },
        setElements,
        selectedElement
      );
      break;
    }

    case "circle": {
      const { x1, y1, x2, y2, xOffset, yOffset } = selectedElement;
      const updatedX1 = clientX - (xOffset ?? 0);
      const updatedY1 = clientY - (yOffset ?? 0);
      const updatedX2 = x2 - x1 + updatedX1;
      const updatedY2 = y2 - y1 + updatedY1;

      updateElement(
        {
          x1: updatedX1,
          y1: updatedY1,
          x2: updatedX2,
          y2: updatedY2,
        },
        setElements,
        selectedElement
      );
      break;
    }
  }
};
