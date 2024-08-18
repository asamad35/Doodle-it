import { atom, useRecoilValue, useSetRecoilState } from "recoil";

const elementsAtom = atom<ElementType[]>({
  key: "elements",
  default: [],
});

export const useElements = () => {
  const elements = useRecoilValue(elementsAtom);
  return elements;
};

export const useSetElement = () => {
  const setElement = useSetRecoilState(elementsAtom);
  return setElement;
};
