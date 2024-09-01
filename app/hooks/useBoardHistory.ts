import { useCallback, useEffect, useState } from "react";
import { defaultDrawing } from "../helper/defaultDrawing";

const useBoardHistory = () => {
  const [boardHistoryStack, setBoardHistoryStack] = useState<ElementType[][]>([
    defaultDrawing,
  ]);
  const [undoHistoryStack, setUndoHistoryStack] = useState<ElementType[][]>([]);

  const pushToBoardHistory = useCallback(
    function (newBoard: ElementType[]) {
      if (undoHistoryStack.length > 0) {
        setUndoHistoryStack([]);
      }
      setBoardHistoryStack((prev) => [...prev, newBoard]);
    },
    [undoHistoryStack]
  );

  const pushToUndoHistory = useCallback(
    function () {
      if (boardHistoryStack.length === 0) return;
      let lastBoard: ElementType[] = [];

      setBoardHistoryStack((prev) => {
        lastBoard = JSON.parse(JSON.stringify(prev[prev.length - 1]));
        return prev.slice(0, -1); // remove the last element
      });

      // Use a timeout to ensure the state update has completed
      setTimeout(() => {
        if (lastBoard.length > 0) {
          setUndoHistoryStack((prevUndo) => [...prevUndo, lastBoard]);
        }
      }, 0);
    },
    [boardHistoryStack]
  );

  const pushFromUndoToBoardHistory = useCallback(
    function () {
      if (undoHistoryStack.length === 0) return;
      let lastBoard: ElementType[] = [];

      setUndoHistoryStack((prev) => {
        lastBoard = JSON.parse(JSON.stringify(prev[prev.length - 1]));
        return prev.slice(0, -1); // remove the last element
      });

      // useState is async, it pushes to callstack
      // Use a timeout to ensure the state update has completed as setTimeout executes after the callstack is empty
      setTimeout(() => {
        if (lastBoard.length > 0) {
          setBoardHistoryStack((prevUndo) => [...prevUndo, lastBoard]);
        }
      }, 0);
    },
    [undoHistoryStack]
  );

  useEffect(() => {
    console.log(undoHistoryStack, "undoHistoryStack");
  }, [undoHistoryStack]);
  useEffect(() => {
    console.log(boardHistoryStack, "boardHistoryStack");
  }, [boardHistoryStack]);

  return {
    pushToBoardHistory,
    boardHistoryStack,
    undoHistoryStack,
    pushFromUndoToBoardHistory,
    pushToUndoHistory,
  };
};

export default useBoardHistory;
