import { atom, useRecoilValue, useSetRecoilState } from "recoil";

const optionsAtom = atom<OptionsType>({
  key: "options",
  default: {
    color: "#0000FF",
    brushSize: 5,
  },
});

export const useOptions = () => {
  const options = useRecoilValue(optionsAtom);
  return options;
};

export const useSetOptions = () => {
  const setOptions = useSetRecoilState(optionsAtom);
  return setOptions;
};
