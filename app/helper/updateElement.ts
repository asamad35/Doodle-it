import { createElement } from "./createElement";

export const updateElement = (
  { x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number },
  setElements: React.Dispatch<React.SetStateAction<ElementType[]>>,
  element: ElementType
) => {
  setElements((prev) => {
    const prevElements = [...prev];
    const targetElement = prevElements.find(
      (prevElement) => prevElement.id === element.id
    );
    if (!targetElement) return prevElements;

    if (element.type === "freehand") {
      if (targetElement.type !== "freehand") return prevElements;
      return [
        ...prevElements.filter(
          (prevElement) => prevElement.id !== targetElement.id
        ),
        {
          ...targetElement,
          points: [...targetElement.points, { x: x2, y: y2 }],
        },
      ];
    }

    if (["rectangle", "circle", "line"].includes(element.type)) {
      const { options } = targetElement;
      const newElement = createElement(
        targetElement.id,
        { x1, y1, x2, y2 },
        element.type,
        options
      ) as RectangleElementType | LineElementType | CircleElementType;

      return [
        ...prevElements.filter(
          (prevElement) => prevElement.id !== targetElement.id
        ),
        newElement,
      ];
    }
    return prevElements;
  });
};
